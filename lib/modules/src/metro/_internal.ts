import { _executeInitializedSubscription, _executeRequiredSubscription } from './subscriptions/_internal'
import { isModuleExportsBad } from './utils'

import type { Metro } from '../../types/metro'

/** Initializing ID */
export let _mInitingId = -1
/** Known uninitialized IDs (not blacklisted) */
export const _mUninited = new Set<Metro.ModuleID>()
/** Known initialized IDs (not blacklisted) */
export const _mInited = new Set<Metro.ModuleID>()

export const _mPaths = new Map<string, Metro.ModuleID>()
export const _mMd = new Map<Metro.ModuleID, [deps: Metro.DependencyMap, initialized: boolean, module?: Metro.Module]>()

export function patchMetroDefine(metroDefine: Metro.DefineFn) {
    return ((origFactory, id, deps) => {
        // deps won't be undefined last time I checked
        const metadata = [deps!, false] as typeof _mMd extends Map<any, infer V> ? V : never
        _mMd.set(id, metadata)
        _mUninited.add(id)

        metroDefine(
            ((global, req, importDefault, importAll, module, exports, deps) => {
                metadata[1] = true
                metadata[2] = module

                const prevIId = _mInitingId
                _mInitingId = id

                _executeRequiredSubscription()

                try {
                    origFactory(global, req, importDefault, importAll, module, exports, deps)
                    // Don't use exports here, as modules can set module.exports to a different object
                    if (isModuleExportsBad(module.exports)) throw undefined

                    // Add the module to the initialized set only if the factory doesn't error or the exports aren't bad
                    _mInited.add(id)
                } catch {
                    _blacklist(id)
                } finally {
                    _mInitingId = prevIId
                    _mUninited.delete(id)
                    // Don't use exports here, as modules can set module.exports to a different object
                    _executeInitializedSubscription(module.exports)
                }
            }) satisfies Metro.FactoryFn,
            id,
            deps,
        )
    }) satisfies Metro.DefineFn
}

/**
 * Blacklists a module. A module can be blacklisted for several reasons:
 *
 * - If the module is already initialized, it either means:
 *   - The module factory threw an error during initialization
 *   - The module exports are bad after initialization
 * - Otherwise, this module is known to be bad from previous caches
 *
 * @param id The module ID to blacklist.
 * @internal
 */
export function _blacklist(id: Metro.ModuleID) {
    // In case blacklisting happens before the module is initialized
    _mUninited.delete(id)

    // Usually we'd also remove the module from _mInited too,
    // but we already have an else block in the patchMetroDefine function that does that for us.
    // _mInited.delete(id)

    // TODO(modules): caching
}
