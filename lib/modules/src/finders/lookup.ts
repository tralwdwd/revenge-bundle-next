import { _mInited, _mMetadatas, _mPaths, _mUninited } from '../metro/_internal'
import {
    type RunFilterOptions,
    type RunFilterReturnExportsOptions,
    runFilter,
    runFilterReturnExports,
} from './_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Metro } from '../../types/metro'
import type { Filter, FilterResult } from './filters'

export type BaseLookupModulesOptions<IncludeUninitialized extends boolean = boolean> = RunFilterOptions & {
    /**
     * Whether to include initialized modules in the lookup.
     *
     * @default true
     */
    includeInitialized?: boolean
    /**
     * Whether to include uninitialized modules in the lookup.
     *
     * Options that require modules to be initialized (eg. `esmReturnNamespace`, `esmSkipDefault`) will be ignored during uninitialized module ID lookup.
     *
     * **This will initialize any modules that match the filter and may cause unintended side effects.**
     *
     * @default false
     */
    includeUninitialized?: IncludeUninitialized
}

export type LookupModulesOptions<
    ReturnNamespace extends boolean = boolean,
    IncludeUninitialized extends boolean = boolean,
> = RunFilterReturnExportsOptions<ReturnNamespace> & BaseLookupModulesOptions<IncludeUninitialized>

export type LookupModulesResult<
    O extends LookupModulesOptions,
    F extends Filter,
> = O extends RunFilterReturnExportsOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>

export type LookupModuleIdsOptions<IncludeUninitialized extends boolean = boolean> =
    BaseLookupModulesOptions<IncludeUninitialized>

/**
 * Lookup module IDs.
 *
 * You can lookup uninitialized module IDs by passing `options.includeUninitialized` when filtering via without-exports filters (eg. `byDependencies`).
 * Use the `moduleStateAware` helper to filter dynamically based on whether the module is initialized or not.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 *
 * @example
 * ```ts
 * const lookup = lookupModuleIds(byProps('createElement'))
 * // Log all module IDs that export React
 * for (const id of lookup) console.log(id)
 * ```
 *
 * @example Lookup uninitialized modules
 * ```ts
 * const lookup = lookupModuleIds(byDependencies([...]), { includeUninitialized: true })
 * // Log all module IDs that has those dependencies
 * for (const id of lookup) console.log(id)
 * ```
 */
export function* lookupModuleIds<O extends LookupModuleIdsOptions>(
    filter: O extends LookupModuleIdsOptions<true> ? Filter<any, false> : Filter,
    options?: O,
): Generator<Metro.ModuleID, undefined> {
    if (options?.includeInitialized ?? true)
        for (const id of _mInited) {
            const { exports } = _mMetadatas.get(id)![1]!
            if (runFilter(filter, id, exports, options)) yield id
        }

    if (options?.includeUninitialized) for (const id of _mUninited) if (runFilter(filter, id)) yield id
}

/**
 * Lookup modules.
 *
 * You can lookup uninitialized modules by passing `options.includeUninitialized` when filtering via without-exports filters (eg. `byDependencies`).
 * Use the `moduleStateAware` helper to filter dynamically based on whether the module is initialized or not.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 *
 * @example
 * ```ts
 * const lookup = lookupModules(byProps('x'))
 * // Log all module exports that has exports.x
 * for (const exports of lookup) console.log(exports)
 * ```
 */
export function lookupModules<F extends Filter>(filter: F): Generator<FilterResult<F>, undefined>

export function lookupModules<
    F extends O extends BaseLookupModulesOptions<true> ? Filter<any, false> : Filter,
    O extends LookupModulesOptions,
>(filter: F, options: O): Generator<LookupModulesResult<O, F>, undefined>

export function* lookupModules(filter: Filter, options?: LookupModulesOptions) {
    if (options?.includeInitialized ?? true)
        for (const id of _mInited) {
            const { exports } = _mMetadatas.get(id)![1]!
            const result = runFilterReturnExports(filter, id, exports, options)
            if (result) yield result
        }

    if (options?.includeUninitialized) for (const id of _mUninited) if (runFilter(filter, id)) yield __r(id)
}

/**
 * Lookup a module ID. Skipping creating a `Generator`.
 *
 * @see {@link lookupModuleIds} for more documentation.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 *
 * @example
 * ```ts
 * const id = lookupModuleId(byProps('createElement'))
 * // Log the first initialized module ID that exports React
 * console.log(id)
 * ```
 *
 * @example Lookup uninitialized modules
 * ```ts
 * const id = lookupModuleId(byDependencies([...]), { includeUninitialized: true })
 * // Log the first initialized module ID that has those dependencies
 * console.log(id)
 * ```
 */
export function lookupModuleId<O extends LookupModuleIdsOptions>(
    filter: O extends BaseLookupModulesOptions<true> ? Filter<any, false> : Filter,
    options?: O,
): Metro.ModuleID | undefined {
    if (options?.includeInitialized ?? true)
        for (const id of _mInited) {
            const { exports } = _mMetadatas.get(id)![1]!
            if (runFilter(filter, id, exports, options)) return id
        }

    if (options?.includeUninitialized) for (const id of _mUninited) if (runFilter(filter, id)) return id
}

/**
 * Lookup a module. Skipping creating a `Generator`.
 *
 * @see {@link lookupModules} for more documentation.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns The first module exports that match the filter.
 *
 * @example
 * ```ts
 * const React = lookupModule(byProps<typeof import('react')>('createElement'))
 * ```
 */
export function lookupModule<F extends Filter>(filter: F): FilterResult<F> | undefined

export function lookupModule<F extends Filter, O extends LookupModulesOptions>(
    filter: F,
    options: O,
): LookupModulesResult<O, F> | undefined

export function lookupModule(filter: Filter, options?: LookupModulesOptions) {
    if (options?.includeInitialized ?? true)
        for (const id of _mInited) {
            const { exports } = _mMetadatas.get(id)![1]!
            const result = runFilterReturnExports(filter, id, exports, options)
            if (result) return result
        }

    if (options?.includeUninitialized) for (const id of _mUninited) if (runFilter(filter, id)) return __r(id)
}

/**
 * Lookup an initialized module by its imported path.
 *
 * Think of it as if you are doing a `import * as exports from path`, the app must have already initialized the module or this will return `undefined`.
 *
 * @param path The path to lookup the module by.
 * @returns The module exports if the module is initialized, or `undefined` if the module is not found or not initialized.
 *
 * @example
 * ```ts
 * const { default: Logger } = lookupModuleByImportedPath<{ default: typeof DiscordModules.Logger }>('modules/debug/Logger.tsx')
 * ```
 */
export function lookupModuleByImportedPath<T = any>(path: string): T | undefined {
    const id = _mPaths.get(path)
    if (id === undefined) return

    if (_mMetadatas.has(id)) return _mMetadatas.get(id)![1]!.exports
}
