/**
 * Custom Metro-compatible methods.
 */

import { handleFactoryCall, mDeps, mList, mUninitialized } from './_internal'
import type { Nullish } from '@revenge-mod/utils/types'
import type { Metro } from '../types'

export const global = globalThis
export const metroRequire = global.__r

// Roll our own define function implementation that replaces Metro's
// This is much more performant than Metro's own define function, which makes initialization faster
export function define(
    factory: Metro.FactoryFn,
    id: Metro.ModuleID,
    dependencyMap: Metro.DependencyMap | Nullish,
) {
    mDeps[id] = dependencyMap!
    mUninitialized.add(id)

    const moduleObject = { exports: {} }

    mList.set(id, {
        dependencyMap: dependencyMap!,
        factory: () => {
            handleFactoryCall(factory, moduleObject)
        },
        publicModule: moduleObject,
    } satisfies Omit<
        Metro.ModuleDefinition<false>,
        'importedDefault' | 'importedAll' | 'isInitialized' | 'hasError'
    > as unknown as Metro.ModuleDefinition<false>)
}

export function metroImportDefault(
    moduleId: Metro.ModuleID,
): Metro.ModuleExports {
    const mod = mList.get(moduleId)!
    if (mod.importedDefault) return mod.importedDefault

    const exports: Metro.ModuleExports = metroRequire(moduleId)
    const importedDefault: Metro.ModuleExports = exports?.__esModule
        ? exports.default
        : exports

    return (mod.importedDefault = importedDefault)
}

export function metroImportAll(moduleId: Metro.ModuleID): Metro.ModuleExports {
    const mod = mList.get(moduleId)!
    if (mod.importedAll) return mod.importedAll

    const exports: Metro.ModuleExports = metroRequire(moduleId)
    let importedAll: Metro.ModuleExports

    if (exports?.__esModule) importedAll = exports
    else {
        importedAll = {}
        if (exports) for (const key in exports) importedAll[key] = exports[key]
        importedAll.default = exports
    }

    return (mod.importedAll = importedAll)
}
