import { type ProxifyOptions, proxify } from '@revenge-mod/utils/proxy'
import { type LookupModulesOptions, lookupModule, lookupModuleByImportedPath, lookupModuleId } from './lookup'
import { type WaitForModulesOptions, waitForModuleByImportedPath, waitForModules } from './wait'

import type { LookupModuleIdsOptions, MaybeDefaultExportMatched } from '.'
import type { Metro } from '../../types/metro'
import type { Filter, FilterResult } from './filters'
import type { RunFilterReturnExportsOptions } from './_internal'

export type BaseFindModuleOptions = {
    /**
     * Abort signal for the find.
     */
    abortSignal?: AbortSignal
    // TODO(modules/finders/find::options): Add an option to force initialize when module ID is known (find is cached).
}

export type FindModuleOptions<
    ReturnNamespace extends boolean = boolean,
    IncludeUninitialized extends boolean = boolean,
> = WaitForModulesOptions<ReturnNamespace> &
    LookupModulesOptions<ReturnNamespace, IncludeUninitialized> &
    BaseFindModuleOptions

export type FindModuleIdOptions<IncludeUninitialized extends boolean = boolean> =
    LookupModuleIdsOptions<IncludeUninitialized> & BaseFindModuleOptions

export type FindModuleResult<
    F extends Filter,
    O extends FindModuleOptions,
> = O extends RunFilterReturnExportsOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>

/**
 * Find a module.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module's exports or rejects if the find is aborted before a module is found.
 *
 * @example
 * ```ts
 * // Resolves after 1 event loop, because the module is already initialized
 * const React = await findModule(byProps<typeof import('react')>('createElement'))
 *
 * // Resolves when the module is initialized
 * const FlashList = await findModule(byProps<typeof import('@shopify/flash-list')>('FlashList'))
 * ```
 */
export function findModule<F extends Filter>(filter: F): Promise<FilterResult<F>>

export function findModule<
    F extends O extends FindModuleOptions<boolean, true> ? Filter<any, false> : Filter,
    O extends FindModuleOptions,
>(filter: F, options: O): Promise<FindModuleResult<F, O>>

export function findModule(filter: Filter, options?: FindModuleOptions) {
    return new Promise((ok, err) => {
        const exports = lookupModule(filter, options!)
        if (exports != null) return ok(exports)

        const unsub = waitForModules(
            filter,
            (_, exports) => {
                unsub()
                ok(exports)
            },
            options!,
        )

        const onAbort = () => {
            unsub()
            err(new Error(`${findModule.name} aborted before resolved: ${filter.key}`))
        }

        const signal = options?.abortSignal
        if (signal) {
            if (signal.aborted) {
                onAbort()
                return
            }

            signal.addEventListener('abort', onAbort, { once: true })
        }
    })
}

/**
 * Find a module ID.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module ID or rejects if the find is aborted before a module ID is found.
 *
 * @example
 * ```ts
 * // Resolves after 1 event loop, because the module is already initialized
 * const ReactId = await findModuleId(byProps('createElement'))
 * const React = __r(ReactId)
 *
 * // Resolves when the module is initialized
 * const FlashListId = await findModuleId(byProps('FlashList'))
 * const FlashListModule = __r(FlashListId)
 * ```
 */
export function findModuleId<O extends FindModuleIdOptions>(
    filter: O extends FindModuleIdOptions<true> ? Filter<any, false> : Filter,
    options?: O,
): Promise<Metro.ModuleID> {
    return new Promise((ok, err) => {
        const id = lookupModuleId(filter, options)
        if (id != null) {
            ok(id)
            return
        }

        const unsub = waitForModules(
            filter,
            id => {
                unsub()
                ok(id)
            },
            options!,
        )

        const onAbort = () => {
            unsub()
            err(new Error(`${findModuleId.name} aborted before resolved: ${filter.key}`))
        }

        const signal = options?.abortSignal
        if (signal) {
            if (signal.aborted) {
                onAbort()
                return
            }

            signal.addEventListener('abort', onAbort, { once: true })
        }
    })
}

/**
 * Find a module by its imported path.
 *
 * @param path The path to find the module by.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module's exports or rejects if the find is aborted before the module is found.
 *
 * @example
 * ```ts
 * const SettingsConstants = await findModuleByImportedPath('modules/main_tabs_v2/native/settings/SettingsConstants.tsx')
 * console.log('Settings page opened') // Logs once the module is initialized
 * ```
 */
export function findModuleByImportedPath<T>(path: string, options?: BaseFindModuleOptions): Promise<T> {
    return new Promise((ok, err) => {
        const exports = lookupModuleByImportedPath(path)
        if (exports != null) {
            ok(exports)
            return
        }

        const unsub = waitForModuleByImportedPath(path, (_, exports) => {
            unsub()
            ok(exports)
        })

        const onAbort = () => {
            unsub()
            err(new Error(`${findModuleByImportedPath.name} aborted before resolved: ${path}`))
        }

        const signal = options?.abortSignal
        if (signal) {
            if (signal.aborted) {
                onAbort()
                return
            }

            signal.addEventListener('abort', onAbort, { once: true })
        }
    })
}

export type BaseFindModuleSyncOptions = BaseFindModuleOptions & ProxifyOptions
export type FindModuleSyncOptions<
    ReturnNamespace extends boolean = boolean,
    IncludeUninitialized extends boolean = boolean,
> = FindModuleOptions<ReturnNamespace, IncludeUninitialized> & BaseFindModuleSyncOptions

/**
 * Find a module synchronously.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns The module exports object if the module is already initialized, or proxified object of the module exports once the module is initialized, or undefined if otherwise.
 *
 * @example
 * ```ts
 * const React = findModuleSync(byProps<typeof import('react')>('createElement'), { hint: 'object' })
 * const App = findModuleSync(byName<React.FC>('App'))
 *
 * console.log(React)
 * // No proxification happens because React is loaded before index module is required
 * // Logs: { createElement: ..., ... }
 *
 * console.log(App)
 * // Logs: [Function], but is actually undefined, calling it will throw an error
 * console.log(unproxify(App))
 * // Logs: undefined
 *
 * onAppInitialized(() => {
 *    console.log(App)
 *    // When the app is initialized, the App component must also be initialized
 *    // Logs: [Function], but is actually function App() { ... }
 *    console.log(unproxify(App))
 *    // Logs: function App() { ... }
 * })
 * ```
 */
export function findModuleSync<F extends Filter>(filter: F): FilterResult<F> | undefined

export function findModuleSync<
    F extends O extends FindModuleSyncOptions<boolean, true> ? Filter<any, false> : Filter,
    O extends FindModuleSyncOptions,
>(filter: F, options: O): FindModuleResult<F, O> | undefined

export function findModuleSync(filter: Filter, options?: FindModuleSyncOptions) {
    const exports = lookupModule(filter, options!)
    if (exports != null) return exports

    let value: unknown | undefined
    const unsub = waitForModules(
        filter,
        (_, exports) => {
            unsub()
            value = exports
        },
        options!,
    )

    const signal = options?.abortSignal
    if (signal) {
        if (signal.aborted) unsub()
        else signal.addEventListener('abort', unsub, { once: true })
    }

    return proxify(() => value, options)
}

/**
 * Find a module by its imported path synchronously.
 *
 * @see {@link findModuleSync} for more details on proxification.
 *
 * @param path The path to find the module by.
 * @param options The options to use for the find.
 * @returns The module exports object if the module is already initialized, or proxified object of the module exports once the module is initialized, or undefined if otherwise.
 *
 * @example
 * ```ts
 * const Logger = findModuleByImportedPathSync<typeof DiscordModules.Logger>('modules/debug/Logger.tsx')
 * ```
 */
export function findModuleByImportedPathSync<T = any>(
    path: string,
    options?: BaseFindModuleSyncOptions,
): T | undefined {
    const exports = lookupModuleByImportedPath<T>(path)
    if (exports != null) return exports

    let value: unknown | undefined
    const unsub = waitForModuleByImportedPath(path, (_, exports) => {
        unsub()
        value = exports
    })

    const signal = options?.abortSignal
    if (signal) {
        if (signal.aborted) unsub()
        else signal.addEventListener('abort', unsub, { once: true })
    }

    return proxify(() => value as T | undefined, options)
}
