import { onAnyModuleInitialized, onModuleFinishedImporting } from '../metro'
import { _bl, _mMetadatas } from '../metro/_internal'
import { runFilterReturnExports } from './_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Metro } from '../../types/metro'
import type { Filter, FilterResult } from './filters'
import type { LookupModulesOptions } from './lookup'

export type WaitForModulesOptions = LookupModulesOptions

/**
 * Wait for modules to initialize by its exports.
 * This is the way to find **uninitialized** module exports that match a filter.
 *
 * **Callback won't be called if the module is already initialized! Use `lookupModule` for already initialized modules.**
 *
 * @param filter The filter to use.
 * @param callback The callback to call when matching modules are initialized.
 * @param options The options to use for the wait.
 * @returns A function to unsubscribe.
 *
 * @example
 * ```ts
 * waitForModule(
 *   byName<typeof import('@shopify/flash-list')>('FlashList'),
 *   // (exports: typeof import('@shopify/flash-list'), id: Metro.ModuleID) => any
 *   (id, exports) => {...}
 * )
 * ```
 */
export function waitForModules<F extends Filter>(
    filter: F,
    callback: (id: Metro.ModuleID, exports: FilterResult<F>) => any,
): () => void

export function waitForModules<F extends Filter, O extends WaitForModulesOptions | undefined>(
    filter: F,
    callback: (
        id: Metro.ModuleID,
        exports: O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>,
    ) => any,
    options: O,
): () => void

export function waitForModules(
    filter: Filter,
    callback: (id: Metro.ModuleID, exports: Metro.ModuleExports) => any,
    options?: WaitForModulesOptions,
) {
    const unsub = onAnyModuleInitialized((id, exports) => {
        if (_bl.has(id)) return
        const result = runFilterReturnExports(filter, id, exports, options)
        if (result) callback(id, exports)
    })

    return unsub
}

/**
 * Wait for a module to initialize by its imported path.
 * @param path The path to wait for.
 * @param callback The callback to call once the module is initialized.
 * @returns A function to unsubscribe.
 */
export function waitForModuleByImportedPath<T = any>(path: string, callback: (id: Metro.ModuleID, exports: T) => any) {
    const unsub = onModuleFinishedImporting((id, cmpPath) => {
        if (path === cmpPath) {
            const { exports } = _mMetadatas.get(id)![1]!
            callback(id, exports)
            unsub()
        }
    })

    return unsub
}
