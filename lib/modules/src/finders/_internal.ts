import { isModuleExportBad } from '../metro'

import type { If } from '@revenge-mod/utils/types'
import type { Metro } from '../../types'
import type { Filter } from './filters'

export interface RunFilterOptions {
    /**
     * Whether to skip checking the default export.
     *
     * @default false
     */
    skipDefault?: boolean
}

export type RunFilterReturnExportsOptions<ReturnNamespace extends boolean = boolean> = RunFilterOptions &
    If<
        ReturnNamespace,
        {
            /**
             * Whether to return the whole module with all exports instead of just the default export **if the default export matches**.
             *
             * @default false
             */
            returnNamespace: true
        },
        {
            returnNamespace?: false
        }
    >

const FilterResultFlags = {
    /**
     * A module was found, without exports filtering.
     */
    Found: 1,
    /**
     * A module was found, and the filter matched the default export.
     */
    Default: 2,
    /**
     * A module was found, and the filter matched the module namespace.
     */
    Namespace: 3,
}

export type FilterResultFlag = (typeof FilterResultFlags)[keyof typeof FilterResultFlags]

// The reason this returns a flag is because flags are never falsy, while exports may be falsy when using ID-only filters (eg. `byDependencies`).

// Currently, we only have options that are relevant for checking exports
// If we add more options later on, do NOT forget about
// adding them here, and passing them in the lookup* functions
export function runFilter(filter: Filter<any, false>, id: Metro.ModuleID): FilterResultFlag | undefined

export function runFilter(
    filter: Filter,
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
    options?: RunFilterOptions,
): FilterResultFlag | undefined

export function runFilter(
    filter: Filter,
    id: Metro.ModuleID,
    exports?: Metro.ModuleExports,
    options?: RunFilterOptions,
): FilterResultFlag | undefined {
    if (exports === undefined) {
        if ((filter as Filter<any, false>)(id)) {
            // TODO(modules/finders/caches)
            return FilterResultFlags.Found
        }

        return
    }

    if (filter(id, exports)) {
        // TODO(modules/finders/caches::namespace)
        return FilterResultFlags.Namespace
    }

    const defaultExport = exports.default
    if (!options?.skipDefault && !isModuleExportBad(defaultExport) && filter(id, defaultExport)) {
        // TODO(modules/finders/caches::default)
        return FilterResultFlags.Default
    }
}

export function exportsFromFilterResultFlag(
    flag: FilterResultFlag,
    exports: Metro.ModuleExports,
    options?: RunFilterReturnExportsOptions,
) {
    if (flag === FilterResultFlags.Default && !options?.returnNamespace) return exports.default
    return exports
}
