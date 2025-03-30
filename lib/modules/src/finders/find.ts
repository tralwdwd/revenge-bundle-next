import { lookupModuleByImportedPath, lookupModuleIds, lookupModules, type LookupModulesOptions } from './lookup'
import { waitForModuleByImportedPath, waitForModules, type WaitForModulesOptions } from './wait'

import type { MaybeDefaultExportMatched } from '.'
import type { Filter, FilterResult } from './filters'
import type { Metro } from '../../types/metro'

export type FindModuleOptions = WaitForModulesOptions & {
    // TODO(modules/finders::options.force): This can cause issues by initializing unexpected modules. Likely won't actually be implemented.
    // Maybe we can add an option to force initialize when cached instead.
    // /**
    //  * Force initialization of modules that haven't been initialized yet. **Not recommended for general use.**
    //  *
    //  * Forcing initialization of modules can lead to unexpected behavior and side effects and should be avoided if possible.
    //  *
    //  * @default false
    //  */
    // force?: boolean
}

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
export function findModule<F extends Filter<any>>(filter: F): Promise<FilterResult<F>>
export function findModule<F extends Filter<any>, O extends FindModuleOptions>(
    filter: F,
    options: O,
): Promise<O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>>
export function findModule<F extends Filter<any>, O extends FindModuleOptions>(filter: F, options?: O) {
    type Result = FilterResult<F>

    return new Promise<O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<Result> : Result>((ok, err) => {
        for (const exports of lookupModules(filter, options!)) return ok(exports)

        // TODO(modules/finders::options.force): Initial implementation for `options.force`.
        // if (options?.force) {
        //     if (signal) console.warn(
        //         "You shouldn't use `options.force` and `options.abortSignal` together! `options.abortSignal` will be ignored.",
        //     )

        //     for (const id of _uninitdIds) {
        //         // TODO(modules/finders): check blacklist cache

        //         try {
        //             __r!(id)
        //         } catch {}

        //         const { exports } = _modules.get(id)![1]!
        //         if (_initdIds.has(id)) {
        //             const result = runFilter(filter, exports, options)
        //             if (result) return rs(result)
        //         }
        //     }

        //     // TODO(modules/finders/caches::notfound)
        //     return
        // }

        waitForModules(filter, ok, options)

        const onAbort = () => err(new Error(`findModule aborted before resolved: ${filter.key}`))
        const signal = options?.abortSignal
        if (signal) {
            if (signal.aborted) return onAbort()
            signal.addEventListener('abort', onAbort, { once: true })
        }
    })
}

/**
 * Find a module by its ID.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns A promise that resolves to the module ID or rejects if the module is not found.
 *
 * @example
 * ```ts
 * const ReactId = await findModuleId(byProps('createElement'))
 * const ReactNativeId = await findModuleId(byProps('AppRegistry'))
 *
 * const React = __r(ReactId)
 * const ReactNative = __r(ReactNativeId)
 */
export function findModuleId<F extends Filter<any>>(filter: F): Promise<Metro.ModuleID>
export function findModuleId<F extends Filter<any>, O extends FindModuleOptions>(
    filter: F,
    options: O,
): Promise<O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>>
export function findModuleId(filter: Filter<any>, options?: FindModuleOptions) {
    return new Promise<Metro.ModuleID>((ok, err) => {
        for (const id of lookupModuleIds(filter, options)) return ok(id)

        waitForModules(filter, (_, id) => ok(id), options)

        const onAbort = () => err(new Error(`findModuleId aborted before resolved: ${filter.key}`))
        const signal = options?.abortSignal
        if (signal) {
            if (signal.aborted) return onAbort()
            signal.addEventListener('abort', onAbort, { once: true })
        }
    })
}

export function findModuleByImportedPath(path: string, options?: FindModuleOptions) {
    return new Promise<any>((ok, err) => {
        const m1 = lookupModuleByImportedPath(path)
        if (m1) return ok(m1)

        waitForModuleByImportedPath(path, ok, options)

        const onAbort = () => err(new Error(`findModuleByImportedPath aborted before resolved: ${path}`))
        const signal = options?.abortSignal
        if (signal) {
            if (signal.aborted) return onAbort()
            signal.addEventListener('abort', onAbort, { once: true })
        }
    })
}

export type FindModuleSyncOptions = WaitForModulesOptions & {
    /**
     * The hint for the proxified object.
     *
     * @default 'function'
     */
    hint?: 'object' | 'function'
}

// TODO(modules/finders::sync): make a lazyValue function to create a proxified object instead of dupe

/**
 * Find a module by its exports synchronously.
 *
 * @param filter The filter to use to find the module.
 * @param options The options to use for the find.
 * @returns The module exports object if the module is already initialized, or proxified object of the module exports once the module is initialized, or undefined if otherwise.
 *
 * @example A little bit after index module is required:
 * ```ts
 * const React = findModuleSync(byProps<typeof import('react')>('createElement'))
 * const App = findModuleSync(byName<React.FC>('App'))
 *
 * // React is defined here because React is loaded before index module is required
 * console.log(React)
 * // { createElement: ..., ... }
 *
 * console.log(App)
 * // undefined
 *
 * onAppInitialized(() => {
 *    // When the app is initialized, the App component must also be initialized
 *    console.log(App)
 *    // function App() { ... }
 * })
 * ```
 */
export function findModuleSync<F extends Filter<any>>(filter: F): FilterResult<F>
export function findModuleSync<F extends Filter<any>, O extends FindModuleSyncOptions>(
    filter: F,
    options: O,
): O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>
export function findModuleSync<F extends Filter<any>, O extends FindModuleSyncOptions>(filter: F, options?: O) {
    for (const exports of lookupModules(filter, options!)) return exports

    type Result = FilterResult<F>
    let value: (O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<Result> : Result) | undefined
    const unsub = waitForModules(
        filter,
        exports => {
            unsub()
            value = exports
        },
        options,
    )

    const handler: ProxyHandler<any> = {
        // biome-ignore lint/complexity/noBannedTypes: Function is the right type here
        apply: (_, thisArg, argArray) => Reflect.apply(value as Function, thisArg, argArray),
        // biome-ignore lint/complexity/noBannedTypes: Function is the right type here
        construct: (_, argArray, newTarget) => Reflect.construct(value as Function, argArray, newTarget),
        defineProperty: (_, property, attributes) => Reflect.defineProperty(value!, property, attributes),
        deleteProperty: (_, p) => Reflect.deleteProperty(value!, p),
        get: (_, p, receiver) => Reflect.get(value!, p, receiver),
        getOwnPropertyDescriptor: (_, p) => Reflect.getOwnPropertyDescriptor(value!, p),
        getPrototypeOf: _ => Reflect.getPrototypeOf(value!),
        has: (_, p) => Reflect.has(value!, p),
        isExtensible: _ => Reflect.isExtensible(value!),
        ownKeys: _ => Reflect.ownKeys(value!),
        preventExtensions: _ => Reflect.preventExtensions(value!),
        set: (_, p, newValue, receiver) => Reflect.set(value!, p, newValue, receiver),
        setPrototypeOf: (_, v) => Reflect.setPrototypeOf(value!, v),
    }

    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    return new Proxy((options?.hint === 'object' ? {} : function () {}) as any, handler) as FilterResult<F>
}

/**
 * Find a module by its imported path synchronously.
 *
 * @param path The path to find the module by.
 * @param options The options to use for the find.
 * @returns The module exports object if the module is already initialized, or proxified object of the module exports once the module is initialized, or undefined if otherwise.
 */
export function findModuleByImportedPathSync<T = any>(path: string, options?: FindModuleSyncOptions): T | undefined {
    const m1 = lookupModuleByImportedPath<T>(path)
    if (m1) return m1

    let value: T | undefined
    const unsub = waitForModuleByImportedPath(
        path,
        (exports: T) => {
            unsub()
            value = exports
        },
        options,
    )

    const handler: ProxyHandler<any> = {
        // biome-ignore lint/complexity/noBannedTypes: Function is the right type here
        apply: (_, thisArg, argArray) => Reflect.apply(value as Function, thisArg, argArray),
        // biome-ignore lint/complexity/noBannedTypes: Function is the right type here
        construct: (_, argArray, newTarget) => Reflect.construct(value as Function, argArray, newTarget),
        defineProperty: (_, property, attributes) => Reflect.defineProperty(value!, property, attributes),
        deleteProperty: (_, p) => Reflect.deleteProperty(value!, p),
        get: (_, p, receiver) => Reflect.get(value!, p, receiver),
        getOwnPropertyDescriptor: (_, p) => Reflect.getOwnPropertyDescriptor(value!, p),
        getPrototypeOf: _ => Reflect.getPrototypeOf(value!),
        has: (_, p) => Reflect.has(value!, p),
        isExtensible: _ => Reflect.isExtensible(value!),
        ownKeys: _ => Reflect.ownKeys(value!),
        preventExtensions: _ => Reflect.preventExtensions(value!),
        set: (_, p, newValue, receiver) => Reflect.set(value!, p, newValue, receiver),
        setPrototypeOf: (_, v) => Reflect.setPrototypeOf(value!, v),
    }

    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    return new Proxy((options?.hint === 'object' ? {} : function () {}) as any, handler) as T
}
