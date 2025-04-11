import { isProxy } from '@revenge-mod/utils/proxy'
import { _bl, _mMd, _mInited } from './_internal'
import type { Metro } from '../../types/metro'

/**
 * Returns whether a module is blacklisted.
 * @param id The module ID to check.
 */
export function isBlacklisted(id: Metro.ModuleID) {
    return _bl.has(id)
}

/**
 * Returns whether a module is initialized.
 * @param id The module ID to check.
 */
export function isModuleInitialized(id: Metro.ModuleID) {
    return _mInited.has(id)
}

/**
 * Returns the dependencies of a module.
 * @param id The module ID.
 */
export function getModuleDependencies(id: Metro.ModuleID) {
    return _mMd.get(id)?.[0]
}

/**
 * Returns the exports of an initialized module.
 * @param id The module ID.
 */
export function getInitializedModuleExports(id: Metro.ModuleID) {
    return _mMd.get(id)?.[1]?.exports
}

/**
 * Returns whether a particular module export is bad. This is used for filter functions to check whether an export is filterable.
 * @param exp The export to check.
 */
export function isModuleExportBad(exp: Metro.ModuleExports[PropertyKey]) {
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
 * Returns whether the module has bad exports. If it does, it should be blacklisted and never hooked into.
 * @param exports The exports of the module.
 */
export function isModuleExportsBad(exports: Metro.ModuleExports) {
    return (
        // Nullish?
        exports == null ||
        // Booleans are not useful
        typeof exports === 'boolean' ||
        // Number exports are not particularly useful either
        // Usually can be found in asset modules, but we already have patches for those
        typeof exports === 'number' ||
        // Checking if the object is empty
        (exports.__proto__ === Object.prototype && !Reflect.ownKeys(exports).length)
    )
}
