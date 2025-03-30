import { runFilter, runFilterReturnExports } from './_internal'
import { _mInited, _mMetadatas, _mPaths } from '../metro/_internal'

import type { MaybeDefaultExportMatched } from '.'
import type { Filter, FilterResult } from './filters'

export type LookupModulesOptions<ReturnNamespace extends boolean = boolean> = {
    /**
     * For ES modules, whether to skip checking the default export.
     *
     * @default false
     */
    esmSkipDefault?: boolean
} & (ReturnNamespace extends true
    ? {
          /**
           * For ES modules, whether to return the whole module with all exports instead of just the default export if the default export matches.
           *
           * CommonJS modules will always return all exports.
           *
           * @default false
           */
          esmReturnNamespace: true
      }
    : {
          esmReturnNamespace?: false
      })

/**
 * Lookup module IDs by its exports.
 * This is the way to get **initialized** module IDs that match a filter.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 */
export function* lookupModuleIds(filter: Filter<any>, options?: LookupModulesOptions) {
    for (const id of _mInited) {
        const { exports } = _mMetadatas.get(id)![1]!
        if (runFilter(filter, exports, id, options)) yield id
    }
}

/**
 * Lookup modules by its exports.
 * This is the way to get **initialized** module exports that match a filter.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 */
export function lookupModules<F extends Filter<any>>(filter: F): Generator<FilterResult<F>>
export function lookupModules<F extends Filter<any>, O extends LookupModulesOptions>(
    filter: F,
    options: O,
): Generator<O extends LookupModulesOptions<true> ? MaybeDefaultExportMatched<FilterResult<F>> : FilterResult<F>>
export function* lookupModules<F extends Filter<any>, O extends LookupModulesOptions>(filter: F, options?: O) {
    for (const id of _mInited) {
        const { exports } = _mMetadatas.get(id)![1]!
        const result = runFilterReturnExports(filter, exports, id, options)
        if (result) yield result
    }
}

/**
 * Lookup module exports by its imported path.
 *
 * @param path The path to lookup the module by.
 * @returns The module exports if the module is initialized, or undefined if the module is not found or not initialized.
 */
export function lookupModuleByImportedPath<T = any>(path: string): T | undefined {
    const id = _mPaths.get(path)
    if (id === undefined) return

    if (_mMetadatas.has(id)) return _mMetadatas.get(id)![1]!.exports
}
