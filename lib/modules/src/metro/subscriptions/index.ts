import { _initAll, _importedPath, _initSpecific, _reqSpecific, _reqAll } from './_internal'

import type { isInitializedModuleBlacklisted } from '../utils'
import type { Metro } from '../../../types/metro'

export type ModuleRequiredCallback = (id: Metro.ModuleID) => void
export type ModuleInitializedCallback = (id: Metro.ModuleID, exports: Metro.ModuleExports) => void
export type ModuleWithImportedPathInitializedCallback = (id: Metro.ModuleID, path: string) => void

/**
 * Registers a callback to be called when any module is initialized.
 *
 * @see {@link isInitializedModuleBlacklisted} to avoid bad module exports.
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
 * @see {@link isInitializedModuleBlacklisted} to avoid bad module exports.
 *
 * @param id The ID of the module.
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onModuleInitialized(id: Metro.ModuleID, callback: ModuleInitializedCallback) {
    if (!_initSpecific.has(id)) _initSpecific.set(id, new Set())
    const set = _initSpecific.get(id)!
    set.add(callback)
    return () => set.delete(callback)
}

/**
 * Registers a callback to be called when a module with a specific import path is initialized.
 *
 * @see {@link isInitializedModuleBlacklisted} to avoid bad module exports.
 *
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onModuleFinishedImporting(callback: ModuleWithImportedPathInitializedCallback) {
    _importedPath.add(callback)
    return () => _importedPath.delete(callback)
}

/**
 * Registers a callback to be called when any module is required the first time.
 *
 * @see {@link isInitializedModuleBlacklisted} to avoid bad module exports.
 *
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onAnyModuleFirstRequired(callback: ModuleRequiredCallback) {
    _reqAll.add(id => callback(id))
    return () => _reqAll.delete(id => callback(id))
}

/**
 * Registers a callback to be called when a specific module is required the first time.
 *
 * @see {@link isInitializedModuleBlacklisted} to avoid bad module exports.
 *
 * @param id The ID of the module.
 * @param callback The callback to be called.
 * @returns A function that unregisters the callback.
 */
export function onModuleFirstRequired(id: Metro.ModuleID, callback: ModuleRequiredCallback) {
    if (!_reqSpecific.has(id)) _reqSpecific.set(id, new Set())
    const set = _reqSpecific.get(id)!
    set.add(callback)
    return () => set.delete(callback)
}
