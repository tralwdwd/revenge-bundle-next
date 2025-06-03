import type { Metro } from '../../types'
import type {
    ModuleFinishedImportingCallback,
    ModuleFirstRequiredCallback,
    ModuleInitializedCallback,
} from '.'

export const _reqAll = new Set<ModuleFirstRequiredCallback>()
export const _req = new Map<Metro.ModuleID, Set<ModuleFirstRequiredCallback>>()
export const _initAll = new Set<ModuleInitializedCallback>()
export const _init = new Map<Metro.ModuleID, Set<ModuleInitializedCallback>>()
export const _path = new Set<ModuleFinishedImportingCallback>()

export function _execReqSubs(id: Metro.ModuleID) {
    for (const cb of _reqAll) cb(id)
    if (_req.has(id)) {
        for (const cb of _req.get(id)!) cb(id)
        _req.delete(id)
    }
}

export function _execInitSubs(
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
) {
    for (const cb of _initAll) cb(id, exports)
    if (_init.has(id)) {
        for (const cb of _init.get(id)!) cb(id, exports)
        _init.delete(id)
    }
}

export function _execPathSubs(id: Metro.ModuleID, path: string) {
    for (const cb of _path) cb(id, path)
}
