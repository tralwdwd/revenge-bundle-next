import {
    getInitializedModuleExports,
    initializedModuleHasBadExports,
    onAnyModuleInitialized,
    onModuleFinishedImporting,
} from '../metro'
import { type RunFilterReturnExportsOptions, exportsFromFilterResultFlag, runFilter } from './_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Metro } from '../../types'
import type { Filter, FilterResult } from './filters'

export type BaseWaitForModulesOptions<IncludeAll extends boolean = boolean> = {
    /**
     * Whether to include all modules, including ones with bad exports.
     *
     * @default false
     */
    includeAll?: IncludeAll
}

export type WaitForModulesOptions<
    ReturnNamespace extends boolean = boolean,
    IncludeBadExports extends boolean = boolean,
> = RunFilterReturnExportsOptions<ReturnNamespace> & BaseWaitForModulesOptions<IncludeBadExports>

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

export function waitForModules<
    F extends O extends WaitForModulesOptions<boolean, true> ? Filter<any, false> : Filter,
    O extends WaitForModulesOptions,
>(filter: F, callback: (id: Metro.ModuleID, exports: WaitForModulesResult<F, O>) => any, options: O): () => void

export function waitForModules(
    filter: Filter,
    callback: (id: Metro.ModuleID, exports: Metro.ModuleExports) => any,
    options?: WaitForModulesOptions,
) {
    return options?.includeAll
        ? onAnyModuleInitialized((id, exports) => {
              const flag = runFilter(filter, id, exports, options)
              if (flag) callback(id, exportsFromFilterResultFlag(flag, exports, options))
          })
        : onAnyModuleInitialized((id, exports) => {
              if (initializedModuleHasBadExports(id)) return
              const flag = runFilter(filter, id, exports, options)
              if (flag) callback(id, exportsFromFilterResultFlag(flag, exports, options))
          })
}

/**
 * Wait for a module to initialize by its imported path. **Callback won't be called if the module is already initialized!**
 *
 * Once callback is called, the subscription will be removed automatically, because modules have unique imported paths.
 *
 * Think of it as if you are doing `import * as exports from path`, and you are also waiting for the app to initialize the module by itself.
 *
 * @param path The path to wait for.
 * @param callback The callback to call once the module is initialized.
 * @param options The options to use for the wait.
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
export function waitForModuleByImportedPath<T = any>(
    path: string,
    callback: (id: Metro.ModuleID, exports: T) => any,
    options?: BaseWaitForModulesOptions,
) {
    const unsub = onModuleFinishedImporting((id, cmpPath) => {
        if (path === cmpPath) {
            unsub()
            if (!options?.includeAll && initializedModuleHasBadExports(id)) return
            callback(id, getInitializedModuleExports(id))
        }
    })

    return unsub
}
