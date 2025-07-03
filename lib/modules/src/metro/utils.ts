import { isProxy } from '@revenge-mod/utils/proxy'
import { _metas } from './_internal'
import type { Metro } from '../types'

/**
 * Returns the dependencies of a module.
 * @param id The module ID.
 * @throws {TypeError} If the module with the given ID does not exist.
 */
export function getModuleDependencies(
    id: Metro.ModuleID,
): Metro.DependencyMap | undefined {
    return _metas.get(id)![0]
}

/**
 * Returns whether a module is initialized.
 * @param id The module ID.
 * @throws {TypeError} If the module with the given ID does not exist.
 */
export function isModuleInitialized(id: Metro.ModuleID): boolean | undefined {
    return _metas.get(id)![1]
}

/**
 * Returns the exports of an initialized module.
 *
 * @see {@link isModuleInitialized} to check if the module is initialized.
 *
 * @param id The module ID.
 * @throws {TypeError} If the module with the given ID does not exist, or is not initialized.
 */
export function getInitializedModuleExports(
    id: Metro.ModuleID,
): Metro.ModuleExports | undefined {
    return _metas.get(id)![2]!.exports
}

/**
 * Returns whether a particular module export is bad. This is used for filter functions to check whether an export is filterable.
 * @param exp The export to check.
 */
export function isModuleExportBad(
    exp: Metro.ModuleExports[PropertyKey],
): boolean {
    return (
        // Nullish?
        exp == null ||
        // Is it a proxy? (discord-intl has proxy exports)
        isProxy(exp) ||
        // Does it have some non-existent key? (Turbo modules)
        (!exp.__proto__ && '\u0001' in exp)
    )
}

/**
 * Returns whether the module has bad exports. If it does, it will be "blacklisted" to avoid filtering issues.
 *
 * **Which module exports are considered bad?** Anything not an object or function, or an empty object.
 *
 * @param exports The exports of the module.
 */
export function isModuleExportsBad(exports: Metro.ModuleExports): boolean {
    return (
        // Nullish?
        exports == null ||
        // Isn't an object or function?
        // - Number exports are not useful, usually just an asset ID
        // - String, Boolean, Symbol, BigInt exports are not useful (who would do `module.exports = ...`?)
        !(
            (exports.__proto__ === Object.prototype &&
                Reflect.ownKeys(exports).length) ||
            exports.__proto__ === Function.prototype
        ) ||
        // Can't run isProxy() on this because this isn't your typical proxy:
        // https://github.com/facebook/react-native/blob/master/packages/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp
        exports === nativeModuleProxy
    )
}
