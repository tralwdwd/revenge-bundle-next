import { isProxy } from '@revenge-mod/utils/proxy'
import { _executeSubscription } from './subscriptions/_internal'

import type { Metro } from '../../types/metro'

export const _bl = new Set<Metro.ModuleID>()

/** Initializing ID */
export let _mInitingId = -1
/** Uninitialized IDs */
export const _mUninited = new Set<Metro.ModuleID>()
/** Initialized IDs */
export const _mInited = new Set<Metro.ModuleID>()

export const _mMetadatas = new Map<Metro.ModuleID, [deps: Metro.DependencyMap, module?: Metro.Module]>()
export const _mPaths = new Map<string, Metro.ModuleID>()

export function patchMetroDefine(metroDefine: Metro.DefineFn) {
    return ((origFactory, id, deps) => {
        // deps won't be undefined last time I checked
        const metadata = [deps!] as typeof _mMetadatas extends Map<any, infer V> ? V : never
        _mMetadatas.set(id, metadata)

        if (_bl.has(id)) {
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

                    if (_isExportsBad(m.exports)) _blacklist(id)
                    // If exports isn't bad, we can put it in the list of initialized modules
                    else _mInited.add(id)
                } finally {
                    _mInitingId = prevIId
                    _mUninited.delete(id)
                    _executeSubscription(id, m)
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
 * - Iterating over the module during `find()`s
 *
 * @param id The module ID to blacklist
 * @internal
 */
export function _blacklist(id: Metro.ModuleID) {
    _bl.add(id)

    // Usually we'd also remove the module from _mInited too,
    // but we already have an else block in the patchMetroDefine function that does that for us.
    // _mInited.delete(id)

    // TODO(modules): caching
}

/**
 * Returns whether the module has bad exports. If it does, it should be blacklisted and never hooked into.
 * @param exports The exports of the module
 * @returns Whether the module has bad exports
 * @internal
 */
export function _isExportsBad(exports: Metro.ModuleExports) {
    return (
        exports === undefined ||
        exports === null ||
        // Empty object (module 0 for example, exports an empty object)
        (exports.__proto__ === Object.prototype && !Reflect.ownKeys(exports).length) ||
        isProxy(exports.default) ||
        exports === globalThis
    )
}
