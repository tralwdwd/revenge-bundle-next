import type { ModuleInitializedCallback, ModuleWithImportedPathInitializedCallback } from '.'
import type { Metro } from '#/metro'

export const _all = new Set<ModuleInitializedCallback>()
export const _specific = new Map<Metro.ModuleID, Set<ModuleInitializedCallback>>()
export const _importedPath = new Set<ModuleWithImportedPathInitializedCallback>()

export function _executeSubscription(id: Metro.ModuleID, exports: Metro.ModuleExports) {
    for (const cb of _all) cb(id, exports)
    if (_specific.has(id)) for (const cb of _specific.get(id)!) cb(id, exports)
}

export function _executeImportedPathSubscription(id: Metro.ModuleID, path: string) {
    for (const cb of _importedPath) cb(id, path)
}
