import { onAnyModuleInitialized, onModuleFinishedImporting } from '../metro'
import { _bl, _mMetadatas } from '../metro/_internal'
import { runFilterReturnExports, type RunFilterReturnExportsOptions } from './_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Metro } from '../../types/metro'
import type { Filter, FilterResult } from './filters'

export type WaitForModulesOptions<ReturnNamespace extends boolean = boolean> =
    RunFilterReturnExportsOptions<ReturnNamespace>

export type WaitForModulesResult<
    F extends Filter,
    O extends WaitForModulesOptions,
> = O extends RunFilterReturnExportsOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>

/**
 * Wait for modules to initialize. **Callback won't be called if the module is already initialized!**
 *
 * @param filter The filter to use.
 * @param callback The callback to call when matching modules are initialized.
 * @param options The options to use for the wait.
 * @returns A function to unsubscribe.
 *
 * @example
 * ```ts
 * const unsub = waitForModules(
 *   byName<typeof import('@shopify/flash-list')>('FlashList'),
 *   // (exports: typeof import('@shopify/flash-list'), id: Metro.ModuleID) => any
 *   (id, exports) => {
 *     unsub()
 *     // Do something with the module...
 *   }
 * )
 * ```
 */
export function waitForModules<F extends Filter>(
    filter: F,
    callback: (id: Metro.ModuleID, exports: FilterResult<F>) => any,
): () => void

export function waitForModules<F extends Filter, O extends WaitForModulesOptions>(
    filter: F,
    callback: (id: Metro.ModuleID, exports: WaitForModulesResult<F, O>) => any,
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
 * Wait for a module to initialize by its imported path. Once callback is called, the subscription will be removed automatically.
 *
 * Think of it as if you are doing `import * as exports from path`, and you are also waiting for the app to initialize the module by itself.
 *
 * @param path The path to wait for.
 * @param callback The callback to call once the module is initialized.
 * @returns A function to unsubscribe.
 *
 * @example
 * ```ts
 * waitForModuleByImportedPath(
 *   'utils/PlatformUtils.tsx',
 *   (id, exports) => {
 *      // Do something with the module...
 *   }
 * )
 * ```
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
