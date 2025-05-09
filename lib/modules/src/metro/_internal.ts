import { _execInitSubs, _execReqSubs } from './subscriptions/_internal'
import { isModuleExportsBad } from './utils'

import type { Metro } from '../types'

/** Initializing ID */
export let _initing = -1
/** Known uninitialized IDs */
export const _uninits = new Set<Metro.ModuleID>()
/** Known initialized IDs (not blacklisted) */
export const _inits = new Set<Metro.ModuleID>()

export const _paths = new Map<string, Metro.ModuleID>()
export const _metas = new Map<
    Metro.ModuleID,
    [deps: Metro.DependencyMap, initialized: boolean, module?: Metro.Module]
>()

export function patchMetroDefine(metroDefine: Metro.DefineFn) {
    return ((origFactory, id, deps) => {
        // deps won't be undefined last time I checked
        const metadata = [deps!, false] as typeof _metas extends Map<any, infer V> ? V : never
        _metas.set(id, metadata)
        _uninits.add(id)

        metroDefine(
            ((global, req, importDefault, importAll, module, exports, deps) => {
                metadata[2] = module

                const prevIId = _initing
                _initing = id

                _execReqSubs(id)

                try {
                    origFactory(global, req, importDefault, importAll, module, exports, deps)
                    metadata[1] = true

                    // Add the module to the initialized set only if the factory doesn't error or the exports aren't bad
                    // Don't use exports here, as modules can set module.exports to a different object
                    if (!isModuleExportsBad(module.exports)) _inits.add(id)
                    _execInitSubs(id, module.exports)
                } catch {}

                _initing = prevIId
                _uninits.delete(id)
            }) satisfies Metro.FactoryFn,
            id,
            deps,
        )
    }) satisfies Metro.DefineFn
}
