import { _mInited, _mMetadatas, _mPaths, _mUninited } from '~/metro/_internal'
import {
    runFilter,
    runFilterReturnExports,
    type RunFilterOptions,
    type RunFilterReturnExportsOptions,
} from './_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Metro } from '#/metro'
import type { Filter, FilterResult } from './filters'

export type BaseLookupModulesOptions = RunFilterOptions

export type LookupModulesOptions<ReturnNamespace extends boolean = boolean> =
    RunFilterReturnExportsOptions<ReturnNamespace>

export type LookupModulesResult<O extends LookupModulesOptions, F extends Filter> = O extends LookupModulesOptions<true>
    ? MaybeDefaultExportMatched<FilterResult<F>>
    : FilterResult<F>

export type LookupModuleIdsOptions<IncludeUninitialized extends boolean = boolean> = BaseLookupModulesOptions & {
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
     * @default false
     */
    includeUninitialized?: IncludeUninitialized
}

/**
 * Lookup module IDs by its exports. You may lookup both uninitialized module IDs when filtering via ID-only filters (eg. `byDependencies`).
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

    if (options?.includeUninitialized)
        for (const id of _mUninited) if (runFilter<Filter<any, false>>(filter, id, undefined, options)) yield id
}

export function lookupModules<F extends Filter>(filter: F): Generator<FilterResult<F>, undefined>

export function lookupModules<F extends Filter, O extends LookupModulesOptions>(
    filter: F,
    options: O,
): Generator<LookupModulesResult<O, F>, undefined>

/**
 * Lookup modules by its exports.
 *
 * `lookupModules` only filters initialized modules. You will need to use `waitForModules` to filter initializing modules.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 */
export function* lookupModules<F extends Filter, O extends LookupModulesOptions>(filter: F, options?: O) {
    for (const id of _mInited) {
        const { exports } = _mMetadatas.get(id)![1]!
        const result = runFilterReturnExports(filter, id, exports, options)
        if (result) yield result
    }
}

/**
 * Lookup module exports by its imported path.
 *
 * `lookupModuleByImportedPath` only finds initialized modules. You will need to use `waitForModuleByImportedPath` to filter initializing modules.
 *
 * @param path The path to lookup the module by.
 * @returns The module exports if the module is initialized, or undefined if the module is not found or not initialized.
 */
export function lookupModuleByImportedPath<T = any>(path: string): T | undefined {
    const id = _mPaths.get(path)
    if (id === undefined) return

    if (_mMetadatas.has(id)) return _mMetadatas.get(id)![1]!.exports
}
