import type { Metro } from '#/metro'
import { _all, _importedPath, _specific } from './_internal'

export type ModuleInitializedCallback = (id: Metro.ModuleID, exports: Metro.ModuleExports) => void
export type ModuleWithImportedPathInitializedCallback = (id: Metro.ModuleID, path: string) => void

/**
 * Registers a callback to be called when any module is initialized. **Some module exports may be bad.**
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onAnyModuleInitialized(callback: ModuleInitializedCallback) {
    _all.add(callback)
    return () => _all.delete(callback)
}

/**
 * Registers a callback to be called when a specific module is initialized. **Module exports may be bad.**
 * @param id The ID of the module.
 * @param callback The callback to be called.
 */
export function onModuleInitialized(id: Metro.ModuleID, callback: ModuleInitializedCallback) {
    if (!_specific.has(id)) _specific.set(id, new Set())
    const set = _specific.get(id)!
    set.add(callback)
    return () => set.delete(callback)
}

/**
 * Registers a callback to be called when a module with a specific import path is initialized.
 * @param callback The callback to be called.
 */
export function onModuleFinishedImporting(callback: ModuleWithImportedPathInitializedCallback) {
    _importedPath.add(callback)
    return () => _importedPath.delete(callback)
}
