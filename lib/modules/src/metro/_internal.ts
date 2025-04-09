import { _executeSubscription } from './subscriptions/_internal'

import type { Metro } from '../../types/metro'
import { isBlacklisted, isModuleExportBad } from '.'

export const _bl = new Set<Metro.ModuleID>()

/** Initializing ID */
export let _mInitingId = -1
/** Uninitialized IDs */
export const _mUninited = new Set<Metro.ModuleID>()
/** Initialized IDs */
export const _mInited = new Set<Metro.ModuleID>()

export const _mPaths = new Map<string, Metro.ModuleID>()
export const _mMd = new Map<Metro.ModuleID, [deps: Metro.DependencyMap, module?: Metro.Module]>()

export function patchMetroDefine(metroDefine: Metro.DefineFn) {
    return ((origFactory, id, deps) => {
        // deps won't be undefined last time I checked
        const metadata = [deps!] as typeof _mMd extends Map<any, infer V> ? V : never
        _mMd.set(id, metadata)

        if (isBlacklisted(id)) {
            metroDefine(origFactory, id, deps)
            return
        }

        _mUninited.add(id)

        metroDefine(
            ((g, r, ipD, ipA, m, e, d) => {
                metadata[1] = m

                const prevIId = _mInitingId
                _mInitingId = id

                try {
                    origFactory(g, r, ipD, ipA, m, e, d)

                    if (isModuleExportBad(m.exports)) _blacklist(id)
                    // If exports isn't bad, we can put it in the list of initialized modules
                    else _mInited.add(id)
                } finally {
                    _mInitingId = prevIId
                    _mUninited.delete(id)
                    _executeSubscription(id, m.exports)
                }
            }) satisfies Metro.FactoryFn,
            id,
            deps,
        )
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

    // Usually we'd also remove the module from _mInited too,
    // but we already have an else block in the patchMetroDefine function that does that for us.
    // _mInited.delete(id)

    // TODO(modules): caching
}
