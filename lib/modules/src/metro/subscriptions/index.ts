import { _init, _initAll, _path, _req, _reqAll } from './_internal'
import type { Metro } from '../../types'

export type ModuleFirstRequiredCallback = (id: Metro.ModuleID) => void
export type ModuleInitializedCallback = (
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
) => void
export type ModuleFinishedImportingCallback = (
    id: Metro.ModuleID,
    path: string,
) => void

/**
 * Registers a callback to be called when any module is initialized.
 *
 * This runs after the module factory has been executed, but before the module is considered initialized by Metro.
 * However, Revenge APIs will consider the module initialized at this point.
 *
 * @see {@link initializedModuleHasBadExports} to avoid bad module exports.
 *
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onAnyModuleInitialized(callback: ModuleInitializedCallback) {
    _initAll.add(callback)
    return () => _initAll.delete(callback)
}

/**
 * Registers a callback to be called when a specific module is initialized.
 *
 * This runs after the module factory has been executed, but before the module is considered initialized by Metro.
 * However, Revenge APIs will consider the module initialized at this point.
 *
 * @see {@link initializedModuleHasBadExports} to avoid bad module exports.
 *
 * @param id The ID of the module.
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onModuleInitialized(
    id: Metro.ModuleID,
    callback: ModuleInitializedCallback,
) {
    let set = _init.get(id)
    if (!set) {
        set = new Set()
        _init.set(id, set)
    }

    set.add(callback)
    return () => set.delete(callback)
}

/**
 * Registers a callback to be called when a module with a specific import path is initialized.
 *
 * @see {@link initializedModuleHasBadExports} to avoid bad module exports.
 *
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onModuleFinishedImporting(
    callback: ModuleFinishedImportingCallback,
) {
    _path.add(callback)
    return () => _path.delete(callback)
}

/**
 * Registers a callback to be called when any module is being initialized.
 *
 * This runs before the module factory is executed.
 *
 * @see {@link initializedModuleHasBadExports} to avoid bad module exports.
 *
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onAnyModuleFirstRequired(
    callback: ModuleFirstRequiredCallback,
) {
    _reqAll.add(callback)
    return () => _reqAll.delete(callback)
}

/**
 * Registers a callback to be called when a specific module is being initialized.
 *
 * This runs before the module factory is executed.
 *
 * @see {@link initializedModuleHasBadExports} to avoid bad module exports.
 *
 * @param id The ID of the module.
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onModuleFirstRequired(
    id: Metro.ModuleID,
    callback: ModuleFirstRequiredCallback,
) {
    let set = _req.get(id)
    if (!set) {
        set = new Set()
        _req.set(id, set)
    }

    set.add(callback)
    return () => set.delete(callback)
}
