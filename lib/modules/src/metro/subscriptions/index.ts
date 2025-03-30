import { _all, _importedPath, _specific } from './_internal'
import type { Metro } from '../../../types/metro'

export type ModuleInitializedCallback = (module: Metro.Module, id: Metro.ModuleID) => void
export type ModuleWithImportedPathInitializedCallback = (id: Metro.ModuleID, importedPath: string) => void

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
