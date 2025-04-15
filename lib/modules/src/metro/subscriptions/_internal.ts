import { _mInitingId } from '../_internal'

import type { ModuleInitializedCallback, ModuleRequiredCallback, ModuleWithImportedPathInitializedCallback } from '.'
import type { Metro } from '../../../types/metro'

export const _reqAll = new Set<ModuleRequiredCallback>()
export const _reqSpecific = new Map<Metro.ModuleID, Set<ModuleRequiredCallback>>()
export const _initAll = new Set<ModuleInitializedCallback>()
export const _initSpecific = new Map<Metro.ModuleID, Set<ModuleInitializedCallback>>()
export const _importedPath = new Set<ModuleWithImportedPathInitializedCallback>()

export function _executeRequiredSubscription() {
    const id = _mInitingId
    for (const cb of _reqAll) cb(id)
    if (_reqSpecific.has(id)) {
        for (const cb of _reqSpecific.get(id)!) cb(id)
        _reqSpecific.delete(id)
    }
}

export function _executeInitializedSubscription(exports: Metro.ModuleExports) {
    const id = _mInitingId
    for (const cb of _initAll) cb(id, exports)
    if (_initSpecific.has(id)) {
        for (const cb of _initSpecific.get(id)!) cb(id, exports)
        _initSpecific.delete(id)
    }
}

export function _executeImportedPathSubscription(path: string) {
    for (const cb of _importedPath) cb(_mInitingId, path)
}
