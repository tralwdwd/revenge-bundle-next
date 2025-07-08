import {
    global,
    define as metroDefine,
    metroImportAll,
    metroImportDefault,
    metroRequire,
} from './custom'
import { onModuleInitialized } from './subscriptions'
import {
    executeImportedPathSubscriptions,
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

    // First __d call
    globalThis[defineKey] = function define(origFactory, id, deps) {
        // Clear the module list so we can keep in sync with Metro's
        mList = __c()

        // Set own implementation of metroImportDefault and metroImportAll
        metroRequire.importDefault = metroImportDefault
        metroRequire.importAll = metroImportAll

        // Set to the our own implementation function
        // And then call the function to define the first module
        ;(globalThis[defineKey] = metroDefine)(origFactory, id, deps)
    }
}

// Why don't we use all the arguments from Metro.FactoryFn?
// Because there's too many for Hermes to be able to its dedicated CallN function which only supports up to 4 arguments. (Call, Call1, Call2, Call3, Call4)
export function handleFactoryCall(
    factory: Metro.FactoryFn,
    moduleObject: Metro.Module,
) {
    const prevIId = mInitializingId
    mInitializingId = moduleObject.id!

    executeRequireSubscriptions(mInitializingId)

    try {
        factory(
            global,
            metroRequire,
            metroImportDefault,
            metroImportAll,
            moduleObject,
            moduleObject.exports,
            mDeps[mInitializingId],
        )

        const { exports: actualExports } = moduleObject

        // Add the module to the initialized set only if the factory doesn't error or the exports aren't bad
        // Don't use exports here, as modules can set module.exports to a different object
        if (actualExports != null) mInitialized.add(mInitializingId)

        executeInitializeSubscriptions(mInitializingId, actualExports)
    } finally {
        mUninitialized.delete(mInitializingId)
        mInitializingId = prevIId
    }
}

/// MODULE PATCHES AND BLACKLISTS

const ImportTrackerModuleId = 2

onModuleInitialized(ImportTrackerModuleId, (_, exports) => {
    const orig = exports.fileFinishedImporting
    exports.fileFinishedImporting = (path: string) => {
        orig(path)
        const id = mInitializingId!
        mImportedPaths.set(path, id)
        executeImportedPathSubscriptions(id, path)
    }
})

const NativeModuleProxyModuleId = 45

// Exports nativeModuleProxy, which we want to blacklist
onModuleInitialized(NativeModuleProxyModuleId, () => {
    mInitialized.delete(NativeModuleProxyModuleId)
})
