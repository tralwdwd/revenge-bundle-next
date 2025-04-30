import { isModuleExportBad } from '../metro'

import type { If } from '@revenge-mod/utils/types'
import type { Metro } from '../../types'
import type { Filter } from './filters'

export type RunFilterOptions = {
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
     * A module was found, and it is an ES module, and the filter matched the module namespace.
     */
    ESModuleNamespace: 2,
    /**
     * A module was found, and it is an ES module, and the filter matched the default export.
     */
    ESModuleDefault: 3,
    /**
     * A module was found, and it is a CommonJS module, and the filter matched the module namespace.
     */
    CJSModuleNamespace: 4,
    /**
     * A module was found, and it is a CommonJS module, and the filter matched the default export.
     */
    CJSModuleDefault: 5,
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
    if (exports == null) {
        if ((filter as Filter<any, false>)(id)) {
            // TODO(modules/finders/caches)
            return FilterResultFlags.Found
        }

        return
    }

    const defaultExport = exports.default
    if (!options?.skipDefault && !isModuleExportBad(defaultExport) && filter(id, defaultExport)) {
        if (exports.__esModule) {
            // TODO(modules/finders/caches::esm::default)
            return FilterResultFlags.ESModuleDefault
        }

        // TODO(modules/finders/caches::cjs::default)
        return FilterResultFlags.CJSModuleDefault
    }

    if (filter(id, exports)) {
        if (exports.__esModule) {
            // TODO(modules/finders/caches::esm::namespace)
            return FilterResultFlags.ESModuleNamespace
        }

        // TODO(modules/finders/caches::cjs::namespace)
        return FilterResultFlags.CJSModuleNamespace
    }
}

export function exportsFromFilterResultFlag(
    flag: FilterResultFlag,
    exports: Metro.ModuleExports,
    options?: RunFilterReturnExportsOptions,
) {
    if (
        (flag === FilterResultFlags.ESModuleDefault || flag === FilterResultFlags.CJSModuleDefault) &&
        !options?.returnNamespace
    )
        return exports.default

    return exports
}
