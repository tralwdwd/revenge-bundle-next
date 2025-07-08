import {
    executeInitializeSubscriptions,
    executeRequireSubscriptions,
} from './subscriptions/_internal'
import type { Metro } from '../types'

/** Initializing ID */
export let mInitializingId: Metro.ModuleID | null = null
/** Known uninitialized IDs */
export const mUninitialized = new Set<Metro.ModuleID>()
/** Known initialized IDs (not blacklisted) */
export const mInitialized = new Set<Metro.ModuleID>()

export const mImportedPaths = new Map<string, Metro.ModuleID>()
export const mDeps: Metro.DependencyMap[] = []

export let mList: Metro.ModuleList

/**
 * Patching Metro's `__d` function to handle module definitions.
 *
 * Here's how Metro sets itself up:
 * 1. `__METRO_GLOBAL_PREFIX__ = ""`
 * 2. `${__METRO_GLOBAL_PREFIX__}__d = function define(...) {}`
 *    - Why don't we patch it here? Because we need to know the value of `__METRO_GLOBAL_PREFIX__` first
 *    - And since Revenge runs before everything else, we need to patch in the next steps:
 *      - We chose to patch it in 4. because we can access all the global functions at that point.
 * 3. `__r = function metroRequire(...) {}`
 * 4. `__c = function clear() {}`
 *
 * 5. `clear()`
 *    - Metro clears the module list via clear(), and not __c() which makes it unpatchable.
 * 6. `__d(..., 0, [...])`
 *    - The first module is defined with ID 0, which is the index module.
 *    - Patch:
 *      - We clear the module list again, so our module list is in sync with Metro's
 * #. `__d` is called with subsequent module definitions
 */
export function patchMetroDefine() {
    const defineKey = `${__METRO_GLOBAL_PREFIX__}__d` as const
    const metroDefine = globalThis[defineKey]

    // Actual patched define function
    const defineRest: Metro.DefineFn = function define(factory, id, deps) {
        mDeps[id] = deps!
        mUninitialized.add(id)

        metroDefine(
            (_, __, ___, ____, moduleObject) => {
                handleFactoryCall(factory, moduleObject)
            },
            id,
            deps,
        )
    }

    // Patched function for first __d call
    globalThis[defineKey] = function define(origFactory, id, deps) {
        // Clear the module list so we can keep in sync with Metro's
        mList = __c()

        metroImportDefault = metroRequire.importDefault
        metroImportAll = metroRequire.importAll

        // Call the actual patched function
        defineRest(origFactory, id, deps)
        // Set to the actual patched function so we can use it later
        globalThis[defineKey] = defineRest
    }
}

/**
 * Returns whether the module has bad exports. If it does, it will be "blacklisted" to avoid filtering issues.
 *
 * **Which module exports are considered bad?** Anything not an object or function, or an empty object.
 *
 * @param exports The exports of the module.
 */
export function isModuleExportsBad(exports: Metro.ModuleExports): boolean {
    return (
        // Nullish?
        exports == null ||
        // Isn't an object or function?
        // - Number exports are not useful, usually just an asset ID
        // - String, Boolean, Symbol, BigInt exports are not useful (who would do `module.exports = ...`?)
        !(
            (exports.__proto__ === Object.prototype &&
                Reflect.ownKeys(exports).length) ||
            exports.__proto__ === Function.prototype
        ) ||
        // Can't run isProxy() on this because this isn't your typical proxy:
        // https://github.com/facebook/react-native/blob/master/packages/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp
        exports === nativeModuleProxy
    )
}

const global = globalThis
const metroRequire = __r
// We can't destructure here because metroRequire.* is set a little later
let metroImportDefault: Metro.RequireFn
let metroImportAll: Metro.RequireFn

function handleFactoryCall(
    factory: Metro.FactoryFn,
    moduleObject: Metro.Module,
) {
    const exports = moduleObject.exports
    const id = moduleObject.id!

    const prevIId = mInitializingId
    mInitializingId = id

    executeRequireSubscriptions(id)

    try {
        factory(
            global,
            metroRequire,
            metroImportDefault,
            metroImportAll,
            moduleObject,
            exports,
            mDeps[id],
        )

        // Add the module to the initialized set only if the factory doesn't error or the exports aren't bad
        // Don't use exports here, as modules can set module.exports to a different object
        if (!isModuleExportsBad(moduleObject.exports)) mInitialized.add(id)
        executeInitializeSubscriptions(id, moduleObject.exports)
    } finally {
        mUninitialized.delete(mInitializingId)
        mInitializingId = prevIId
    }
}
