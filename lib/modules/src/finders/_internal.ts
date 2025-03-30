import { _isExportsBad } from '../metro/_internal'

import type { Filter } from './filters'
import type { LookupModulesOptions } from './lookup'
import type { Metro } from '../../types'

const FindResultFlags = {
    // ? Our design does not allow for this to be used, but it is here for future reference.
    // /**
    //  * The find was unsuccessful.
    //  */
    // NotFound: 0,
    /**
     * A module was found and the find was successful.
     * However, the module type could not be determined. It is most likely a CommonJS module.
     */
    Found: 1,
    /**
     * The module was found and the find was successful.
     * The module is an ES module, and the filter matched the module namespace.
     */
    ESModuleNamespace: 2,
    /**
     * The module was found and the find was successful.
     * The module is an ES module, and the filter matched the default export.
     */
    ESModuleDefault: 3,
}

export type FindResultFlag = (typeof FindResultFlags)[keyof typeof FindResultFlags]

export function runFilterReturnExports(
    filter: Filter<any>,
    exports: Metro.ModuleExports,
    id: Metro.ModuleID,
    options?: LookupModulesOptions,
) {
    const flag = runFilter(filter, exports, id, options)

    if (flag) {
        if (flag === FindResultFlags.ESModuleDefault && !options?.esmReturnNamespace) return exports.default

        return exports
    }
}

export function runFilter(
    filter: Filter<any>,
    exports: Metro.ModuleExports,
    id: Metro.ModuleID,
    options?: LookupModulesOptions,
): FindResultFlag | false {
    if (exports.__esModule) {
        const { default: defaultExport } = exports

        if (!options?.esmSkipDefault && !_isExportsBad(defaultExport) && filter(defaultExport, id)) {
            // TODO(modules/finders/caches::esm::default)
            return FindResultFlags.ESModuleDefault
        }

        if (filter(exports, id)) {
            // TODO(modules/finders/caches::esm::namespace)
            return FindResultFlags.ESModuleNamespace
        }
    } else if (filter(exports, id)) {
        // TODO(modules/finders/caches)
        return FindResultFlags.Found
    }

    return false
}
