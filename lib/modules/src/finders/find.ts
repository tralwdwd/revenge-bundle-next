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

export type FindModuleOptions = WaitForModulesOptions & LookupModulesOptions & BaseFindModuleOptions

export type FindModuleIdOptions = LookupModuleIdsOptions & FindModuleOptions

/**
 * Find a module by its exports.
 *
 * This is a combination of `lookupModule` and `waitForModule`.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module's exports or rejects if the find is aborted before a module is found.
 *
 * @example
 * ```ts
 * const React = await findModule(byProps<typeof import('react')>('createElement'))
 * const ReactNative = await findModule(byProps<typeof import('react-native')>('AppRegistry'))
 * ```
 */
export function findModule<F extends Filter>(filter: F): Promise<FilterResult<F>>

export function findModule<F extends Filter, O extends FindModuleOptions>(
    filter: F,
    options: O,
): Promise<O extends RunFilterReturnExportsOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>>

export function findModule<F extends Filter, O extends FindModuleOptions>(filter: F, options?: O) {
    type Result = FilterResult<F>

    return new Promise<O extends RunFilterReturnExportsOptions<true> ? MaybeDefaultExportMatched<Result> : Result>(
        (ok, err) => {
            const exports = lookupModule<F, O>(filter, options!)
            if (exports !== undefined) return ok(exports)

            const unsub = waitForModules<F, O>(
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
        },
    )
}

/**
 * Find a module by its ID.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module ID or rejects if the find is aborted before a module ID is found.
 *
 * @example
 * ```ts
 * const ReactId = await findModuleId(byProps('createElement'))
 * const ReactNativeId = await findModuleId(byProps('AppRegistry'))
 *
 * const React = __r(ReactId)
 * const ReactNative = __r(ReactNativeId)
 */
export function findModuleId<F extends Filter>(filter: F): Promise<Metro.ModuleID>

export function findModuleId<F extends Filter, O extends FindModuleIdOptions>(
    filter: F,
    options: O,
): Promise<O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>>

export function findModuleId(filter: Filter, options?: FindModuleIdOptions) {
    return new Promise<Metro.ModuleID>((ok, err) => {
        const id = lookupModuleId(filter, options)
        if (id !== undefined) {
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
 * @param path The path to find the module by.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module's exports or rejects if the find is aborted before the module is found.
 */
export function findModuleByImportedPath<T>(path: string, options?: BaseFindModuleOptions): Promise<T> {
    return new Promise((ok, err) => {
        const exports = lookupModuleByImportedPath(path)
        if (exports !== undefined) {
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
export type FindModuleSyncOptions = FindModuleOptions & BaseFindModuleSyncOptions

/**
 * Find a module by its exports synchronously.
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
 * // No proxification happens because React is loaded before index module is required
 * console.log(React)
 * // { createElement: ..., ... }
 *
 * console.log(App)
 * // Logs: [Function], but is actually undefined, calling it will throw an error
 *
 * onAppInitialized(() => {
 *    // When the app is initialized, the App component must also be initialized
 *    console.log(App)
 *    // Logs: [Function], but is actually function App() { ... }
 * })
 * ```
 */
export function findModuleSync<F extends Filter>(filter: F): FilterResult<F>

export function findModuleSync<F extends Filter, O extends FindModuleSyncOptions>(
    filter: F,
    options: O,
): O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>

export function findModuleSync<F extends Filter, O extends FindModuleSyncOptions>(filter: F, options?: O) {
    const exports = lookupModule(filter, options!)
    if (exports !== undefined) return exports

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
 * @param path The path to find the module by.
 * @param options The options to use for the find.
 * @returns The module exports object if the module is already initialized, or proxified object of the module exports once the module is initialized, or undefined if otherwise.
 */
export function findModuleByImportedPathSync<T = any>(
    path: string,
    options?: BaseFindModuleSyncOptions,
): T | undefined {
    const exports = lookupModuleByImportedPath<T>(path)
    if (exports !== undefined) return exports

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
