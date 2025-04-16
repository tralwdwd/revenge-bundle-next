import { isModuleExportBad } from '../metro'

import type { If } from '@revenge-mod/utils/types'
import type { Metro } from '../../types/metro'
import type { Filter } from './filters'

export type RunFilterOptions = {
    /**
     * For ES modules, whether to skip checking the default export.
     *
     * @default false
     */
    esmSkipDefault?: boolean
}

export type RunFilterReturnExportsOptions<ReturnNamespace extends boolean = boolean> = RunFilterOptions &
    If<
        ReturnNamespace,
        {
            /**
             * For ES modules, whether to return the whole module with all exports instead of just the default export **if the default export matches**.
             *
             * CommonJS modules will always return all exports.
             *
             * @default false
             */
            esmReturnNamespace: true
        },
        {
            esmReturnNamespace?: false
        }
    >

const FilterResultFlags = {
    /**
     * A module was found.
     */
    Found: 1,
    /**
     * A module was found, and it is an ES module, and the filter matched the module namespace.
     */
    ESModuleNamespace: 2,
    /**
     * A module was found, and it is an ES module, and the filter matched the default export.
     */
    ESModuleDefault: 3,
}

export type FilterResultFlag = (typeof FilterResultFlags)[keyof typeof FilterResultFlags]

// The reason this returns a flag is because flags are never falsy, while exports may be falsy when using ID-only filters (eg. `byDependencies`).

// Currently, we only have options that are relevant for checking exports
// If we add more options later on, do NOT forget about
// adding them here, and passing them in the lookup* functions
export function runFilter(filter: Filter<any, false>, id: Metro.ModuleID): FilterResultFlag | false

export function runFilter(
    filter: Filter,
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
    options?: RunFilterOptions,
): FilterResultFlag | false

export function runFilter(
    filter: Filter,
    id: Metro.ModuleID,
    exports?: Metro.ModuleExports,
    options?: RunFilterOptions,
): FilterResultFlag | false {
    if (exports?.__esModule) {
        const { default: defaultExport } = exports

        // TODO(modules/caches/flags): could cache here that default export is bad
        if (!options?.esmSkipDefault && !isModuleExportBad(defaultExport) && filter(id, defaultExport)) {
            // TODO(modules/finders/caches::esm::default)
            return FilterResultFlags.ESModuleDefault
        }

        if (filter(id, exports)) {
            // TODO(modules/finders/caches::esm::namespace)
            return FilterResultFlags.ESModuleNamespace
        }
    } else if (filter(id, exports)) {
        // TODO(modules/finders/caches)
        return FilterResultFlags.Found
    }

    return false
}

export function exportsFromFilterResultFlag(
    flag: FilterResultFlag,
    exports: Metro.ModuleExports,
    options?: RunFilterReturnExportsOptions,
) {
    if (flag === FilterResultFlags.ESModuleDefault && !options?.esmReturnNamespace) return exports.default
    return exports
}
