import { _executeSubscription } from './subscriptions/_internal'
import { isBlacklisted, isModuleExportsBad } from './utils'

import type { Metro } from '../../types/metro'

export const _bl = new Set<Metro.ModuleID>()

/** Initializing ID */
export let _mInitingId = -1
/** Uninitialized IDs */
export const _mUninited = new Set<Metro.ModuleID>()
/** Known initialized IDs (exports aren't bad) */
export const _mInited = new Set<Metro.ModuleID>()

export const _mPaths = new Map<string, Metro.ModuleID>()
export const _mMd = new Map<Metro.ModuleID, [deps: Metro.DependencyMap, module?: Metro.Module]>()

export function patchMetroDefine(metroDefine: Metro.DefineFn) {
    return ((origFactory, id, deps) => {
        // deps won't be undefined last time I checked
        const metadata = [deps!] as typeof _mMd extends Map<any, infer V> ? V : never
        _mMd.set(id, metadata)

        if (isBlacklisted(id)) metroDefine(origFactory, id, deps)
        else {
            _mUninited.add(id)

            metroDefine(
                ((global, req, importDefault, importAll, module, exports, deps) => {
                    metadata[1] = module

                    const prevIId = _mInitingId
                    _mInitingId = id

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
                        _executeSubscription(id, module.exports)
                    }
                }) satisfies Metro.FactoryFn,
                id,
                deps,
            )
        }
    }) satisfies Metro.DefineFn
}

/**
 * Blacklists a module.
 *
 * Blacklisting modules prevents Revenge from doing the following things:
 *
 * - Iterating over the module during `find()`s.
 *
 * @param id The module ID to blacklist.
 * @internal
 */
export function _blacklist(id: Metro.ModuleID) {
    _bl.add(id)
    // In case blacklisting happens before the module is initialized
    _mUninited.delete(id)

    // Usually we'd also remove the module from _mInited too,
    // but we already have an else block in the patchMetroDefine function that does that for us.
    // _mInited.delete(id)

    // TODO(modules): caching
}
