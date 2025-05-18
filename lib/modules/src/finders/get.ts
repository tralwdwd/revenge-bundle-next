import { noopFalse } from '@revenge-mod/utils/callbacks'

import { type LookupModulesOptions, lookupModule, lookupModuleByImportedPath } from './lookup'
import { type WaitForModulesOptions, waitForModuleByImportedPath, waitForModules } from './wait'

import type { MaybeDefaultExportMatched } from '../types'
import type { Metro } from '../types'
import type { RunFilterReturnExportsOptions } from './_internal'
import type { Filter, FilterResult } from './filters'

export type GetModuleOptions<
    ReturnNamespace extends boolean = boolean,
    IncludeUninitialized extends boolean = boolean,
> = WaitForModulesOptions<ReturnNamespace> & LookupModulesOptions<ReturnNamespace, IncludeUninitialized>

export type GetModuleResult<
    F extends Filter,
    O extends GetModuleOptions,
> = O extends RunFilterReturnExportsOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>

export type GetModuleCallback<T> = (exports: T, id: Metro.ModuleID) => any

export type GetModuleUnsubscribeFunction = () => boolean

/**
 * Get a module matching the filter.
 *
 * This is a combination of {@link lookupModule} and {@link waitForModules}.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module's exports or rejects if the find is aborted before a module is found.
 *
 * @example
 * ```ts
 * getModule(byProps<typeof import('react')>('createElement'), React => {
 *   // Immediately called because React is always initialized when plugins are loaded
 * })
 *
 * getModule(byProps<typeof import('@shopify/flash-list')>('FlashList'), FlashList => {
 *   // Called when the module is initialized
 * })
 * ```
 */
export function getModule<F extends Filter>(
    filter: F,
    callback: GetModuleCallback<FilterResult<F>>,
): GetModuleUnsubscribeFunction

export function getModule<
    F extends O extends GetModuleOptions<boolean, true> ? Filter<any, false> : Filter,
    O extends GetModuleOptions,
>(filter: F, callback: GetModuleCallback<FilterResult<F>>, options: O): GetModuleUnsubscribeFunction

export function getModule(filter: Filter, callback: GetModuleCallback<any>, options?: GetModuleOptions) {
    const [exports, id] = lookupModule(filter, options!)
    if (id != null) {
        callback(exports, id)
        return noopFalse
    }

    const unsub = waitForModules(
        filter,
        (id, exports) => {
            unsub()
            callback(exports, id)
        },
        options!,
    )

    return unsub
}

/**
 * Get a module by its imported path.
 *
 * @param path The path to find the module by.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module's exports or rejects if the find is aborted before the module is found.
 *
 * @example
 * ```ts
 * getModuleByImportedPath('modules/main_tabs_v2/native/settings/SettingsConstants.tsx', SettingsConstants => {
 *   console.log('Settings page opened') // Logs once the module is initialized
 * })
 * ```
 */
export function getModuleByImportedPath<T>(path: string, callback: GetModuleCallback<T>): GetModuleUnsubscribeFunction {
    const [exports, id] = lookupModuleByImportedPath(path)
    if (id != null) {
        callback(exports, id)
        return noopFalse
    }

    const unsub = waitForModuleByImportedPath(path, (exports, id) => {
        unsub()
        callback(exports, id)
    })

    return unsub
}
