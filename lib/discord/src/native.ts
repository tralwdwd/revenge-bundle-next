import type { DiscordNativeModules } from './types/native'

/**
 * Naming conventions:
 * - Always use the most recent module name (if we can do it in a non-breaking way)
 * - If the module name starts with "Native", remove it
 * - If the module name starts with "RTN", remove it
 * - If the module name ends with "Module", include it
 * - If the module name ends with "Manager", include it
 */

const nmp = nativeModuleProxy

export const CacheModule = __turboModuleProxy(
    'NativeCacheModule',
) as DiscordNativeModules.CacheModule
export const FileModule = __turboModuleProxy(
    'NativeFileModule',
) as DiscordNativeModules.FileModule
export const ClientInfoModule = __turboModuleProxy(
    'NativeClientInfoModule',
) as DiscordNativeModules.ClientInfoModule
export const DeviceModule = __turboModuleProxy(
    'NativeDeviceModule',
) as DiscordNativeModules.DeviceModule
export const BundleUpdaterManager =
    nmp.BundleUpdaterManager as DiscordNativeModules.BundleUpdaterManager
export const ThemeModule = __turboModuleProxy(
    'NativeThemeModule',
) as DiscordNativeModules.ThemeModule
