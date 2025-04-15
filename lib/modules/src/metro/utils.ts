import { isProxy } from '@revenge-mod/utils/proxy'
import { _mInited, _mMd, _mUninited } from './_internal'

import type { Metro } from '../../types/metro'

/**
 * Returns whether an uninitialized module is blacklisted.
 *
 * @see {@link isModuleExportsBad} for more information on what is considered a bad module export.
 *
 * @param id The module ID.
 */
export function isUninitializedModuleBlacklisted(id: Metro.ModuleID): boolean {
    return !_mUninited.has(id)
}

/**
 * Returns whether an initialized module is blacklisted.
 *
 * @see {@link isModuleExportsBad} for more information on what is considered a bad module export.
 *
 * @param id The module ID.
 */
export function isInitializedModuleBlacklisted(id: Metro.ModuleID): boolean {
    return !_mInited.has(id)
}

/**
 * Returns the dependencies of a module.
 * @param id The module ID.
 */
export function getModuleDependencies(id: Metro.ModuleID): Metro.DependencyMap | undefined {
    return _mMd.get(id)?.[0]
}

/**
 * Returns the exports of an initialized module.
 * @param id The module ID.
 */
export function getInitializedModuleExports(id: Metro.ModuleID): Metro.ModuleExports | undefined {
    return _mMd.get(id)?.[1]?.exports
}

/**
 * Returns whether a particular module export is bad. This is used for filter functions to check whether an export is filterable.
 * @param exp The export to check.
 */
export function isModuleExportBad(exp: Metro.ModuleExports[PropertyKey]): boolean {
    return (
        // Nullish?
        exp == null ||
        // Is it a proxy? (discord-intl has proxy exports)
        isProxy(exp) ||
        // Can't run isProxy() on this because this isn't your typical proxy:
        // https://github.com/discord/react-native/blob/master/packages/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp
        exp === nativeModuleProxy
    )
}

/**
 * Returns whether the module has bad exports. If it does, it will be blacklisted to avoid filtering issues.
 *
 * `/finders` will always avoid blacklisted modules. To look for blacklisted modules, use `/metro/subscriptions`.
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
        !(typeof exports === 'object' || exports.__proto__ === Function.prototype) ||
        // Checking if the object is empty
        (exports.__proto__ === Object.prototype && !Reflect.ownKeys(exports).length)
    )
}
