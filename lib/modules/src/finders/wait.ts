import { _inits } from '../metro/_internal'
import {
    onAnyModuleInitialized,
    onModuleFinishedImporting,
} from '../metro/subscriptions'
import { getInitializedModuleExports } from '../metro/utils'
import { exportsFromFilterResultFlag, runFilter } from './_internal'
import type { MaybeDefaultExportMatched, Metro } from '../types'
import type { RunFilterReturnExportsOptions } from './_internal'
import type { Filter, FilterResult } from './filters'

export interface BaseWaitForModulesOptions<
    IncludeAll extends boolean = boolean,
> {
    /**
     * Whether to include all modules, including ones with bad exports.
     *
     * @default false
     */
    includeAll?: IncludeAll
}

export type WaitForModulesUnsubscribeFunction = () => boolean

export type WaitForModulesCallback<T> = (exports: T, id: Metro.ModuleID) => any

export type WaitForModulesOptions<
    ReturnNamespace extends boolean = boolean,
    IncludeBadExports extends boolean = boolean,
> = RunFilterReturnExportsOptions<ReturnNamespace> &
    BaseWaitForModulesOptions<IncludeBadExports>

export type WaitForModulesResult<
    F extends Filter,
    O extends WaitForModulesOptions,
> = O extends RunFilterReturnExportsOptions<true>
    ? MaybeDefaultExportMatched<FilterResult<F>>
    : FilterResult<F>

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
 *   (exports, id) => {
 *     unsub()
 *     // Do something with the module...
 *   }
 * )
 * ```
 */
export function waitForModules<F extends Filter>(
    filter: F,
    callback: WaitForModulesCallback<WaitForModulesResult<F, object>>,
): WaitForModulesUnsubscribeFunction

export function waitForModules<
    F extends O extends WaitForModulesOptions<boolean, true>
        ? Filter<any, false>
        : Filter,
    O extends WaitForModulesOptions,
>(
    filter: F,
    callback: WaitForModulesCallback<WaitForModulesResult<F, O>>,
    options: O,
): WaitForModulesUnsubscribeFunction

export function waitForModules(
    filter: Filter,
    callback: WaitForModulesCallback<any>,
    options?: WaitForModulesOptions,
) {
    return onAnyModuleInitialized(
        options?.includeAll
            ? (id, exports) => {
                  const flag = runFilter(filter, id, exports, options)
                  if (flag)
                      callback(
                          exportsFromFilterResultFlag(flag, exports, options),
                          id,
                      )
              }
            : (id, exports) => {
                  if (_inits.has(id)) {
                      const flag = runFilter(filter, id, exports, options)
                      if (flag)
                          callback(
                              exportsFromFilterResultFlag(
                                  flag,
                                  exports,
                                  options,
                              ),
                              id,
                          )
                  }
              },
    )
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
 *   (exports, id) => {
 *      // Do something with the module...
 *   }
 * )
 * ```
 */
export function waitForModuleByImportedPath<T = any>(
    path: string,
    callback: WaitForModulesCallback<T>,
    options?: BaseWaitForModulesOptions,
) {
    const unsub = onModuleFinishedImporting(
        options?.includeAll
            ? (id, cmpPath) => {
                  if (path === cmpPath) {
                      unsub()
                      callback(getInitializedModuleExports(id), id)
                  }
              }
            : (id, cmpPath) => {
                  if (path === cmpPath && _inits.has(id)) {
                      unsub()
                      callback(getInitializedModuleExports(id), id)
                  }
              },
    )

    return unsub
}
