import { runFilterReturnExports } from './_internal'
import { onAnyModuleInitialized, onModuleFinishedImporting } from '../metro'
import { _bl, _mMetadatas } from '../metro/_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Filter, FilterResult } from './filters'
import type { LookupModulesOptions } from './lookup'
import type { Metro } from '../../types'

export type WaitForModulesOptions = LookupModulesOptions & {
    /**
     * Abort signal for the wait.
     *
     * **The find will only be aborted when it is pending/requires waiting for the module to be initialized.**
     */
    abortSignal?: AbortSignal
}

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
 *   (exports, id) => {...}
 * )
 * ```
 */
export function waitForModules<F extends Filter<any>>(
    filter: F,
    callback: (exports: FilterResult<F>, id: Metro.ModuleID) => any,
): () => void
export function waitForModules<F extends Filter<any>, O extends WaitForModulesOptions>(
    filter: F,
    callback: (
        exports: O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>,
        id: Metro.ModuleID,
    ) => any,
    options?: O,
): () => void
export function waitForModules<F extends Filter<any>, O extends WaitForModulesOptions>(
    filter: F,
    callback: (
        exports: O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>,
        id: Metro.ModuleID,
    ) => any,
    options?: O,
) {
    const unsub = onAnyModuleInitialized(({ exports }, id) => {
        if (_bl.has(id)) return
        const result = runFilterReturnExports(filter, exports, id, options)
        if (result) callback(result, id)
    })

    const signal = options?.abortSignal
    if (signal) {
        if (signal.aborted) {
            unsub()
            return unsub
        }

        signal.addEventListener('abort', unsub, { once: true })
    }

    return unsub
}

/**
 * Wait for a module to initialize by its imported path.
 * @param path The path to wait for.
 * @param callback The callback to call once the module is initialized.
 * @returns A function to unsubscribe.
 */
export function waitForModuleByImportedPath<T = any>(
    path: string,
    callback: (exports: T, id: Metro.ModuleID) => any,
    options?: WaitForModulesOptions,
) {
    const unsub = onModuleFinishedImporting((id, cmpPath) => {
        if (path === cmpPath) {
            callback(_mMetadatas.get(id)![1]!.exports, id)
            unsub()
        }
    })

    const signal = options?.abortSignal
    if (signal) {
        if (signal.aborted) {
            unsub()
            return unsub
        }

        signal.addEventListener('abort', unsub, { once: true })
    }

    return unsub
}
