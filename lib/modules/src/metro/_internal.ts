import { _executeInitializedSubscription, _executeRequiredSubscription } from './subscriptions/_internal'
import { isModuleExportsBad } from './utils'

import type { Metro } from '../../types'

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

                _executeRequiredSubscription(id)

                try {
                    origFactory(global, req, importDefault, importAll, module, exports, deps)
                    // Don't use exports here, as modules can set module.exports to a different object
                    if (isModuleExportsBad(module.exports)) throw undefined

                    // Add the module to the initialized set only if the factory doesn't error or the exports aren't bad
                    _mInited.add(id)
                } catch {
                } finally {
                    _mInitingId = prevIId
                    _mUninited.delete(id)
                    // Don't use exports here, as modules can set module.exports to a different object
                    _executeInitializedSubscription(id, module.exports)
                }
            }) satisfies Metro.FactoryFn,
            id,
            deps,
        )
    }) satisfies Metro.DefineFn
}
