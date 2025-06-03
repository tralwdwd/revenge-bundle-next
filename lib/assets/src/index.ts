import { ReactNative } from '@revenge-mod/react'
import { _customs, _metas, _overrides } from './_internal'
import { cache } from './caches'
import { AssetRegistry } from './preinit'
import type { Metro } from '@revenge-mod/modules/types'
import type { Asset, AssetId, RegisterableAsset } from './types'

export { AssetRegistry, AssetRegistryModuleId } from './preinit'

// iOS cannot display SVGs
let _preferredType: Asset['type'] =
    ReactNative.Platform.OS === 'ios' ? 'png' : 'svg'

/**
 * Set the preferred asset type. This is used to determine which asset to use when multiple types are available.
 *
 * @param type The preferred asset type.
 */
export function setPreferredAssetType(type: Asset['type']) {
    _preferredType = type
}

/**
 * Yields all registered assets, including ones with same name but different types, custom assets, and overriden assets.
 */
export function* getAssets(): Generator<Asset> {
    for (const name of Object.keys(cache!))
        for (const mid of Object.values(cache[name]))
            yield AssetRegistry.getAssetByID(__r(mid)) as Asset

    for (const asset of _customs) yield asset
}

/**
 * Get an asset by its name.
 * If more than one asset is registered with the same name, this will return the one with the preferred type, or the first registered one.
 *
 * @param name The asset name.
 */
export function getAssetByName(name: string): Asset | undefined {
    const id = getAssetIdByName(name)
    if (id !== undefined) return AssetRegistry.getAssetByID(id)
}

/**
 * Gets all assets matching the name.
 *
 * @param name The asset name.
 * @returns A record keyed by the type of the asset, with the value being the asset itself.
 */
export function getAssetsByName(
    name: string,
): Record<Asset['type'], Asset> | undefined {
    const reg = cache[name]
    if (!reg) return

    return Object.entries(reg).reduce(
        (acc, [type, mid]) => {
            acc[type as Asset['type']] = AssetRegistry.getAssetByID(__r(mid))!
            return acc
        },
        {} as Record<Asset['type'], Asset>,
    )
}

/**
 * Get the ID of an asset.
 *
 * @param asset The asset to get the ID for.
 */
export function getAssetId(asset: Asset): AssetId | undefined {
    return _metas.get(asset)?.[0]
}

/**
 * Get an asset ID by its name.
 * If more than one asset is registered with the same name, this will return the one with the preferred type, or the first registered one.
 *
 * @param name The asset name.
 */
export function getAssetIdByName(name: string): AssetId | undefined {
    const reg = cache[name]
    if (!reg) return

    const mid = reg[_preferredType] ?? reg[Object.keys(reg)[0]!]
    if (mid !== undefined) return __r(mid)
}

/**
 * Get the module ID that registered the asset. Returns `-1` if the asset is a custom asset.
 *
 * @param asset The asset to get the module ID for.
 */
export function getAssetModuleId(
    asset: Asset,
): Metro.ModuleID | -1 | undefined {
    return _metas.get(asset)?.[1]
}

/**
 * Register an asset with the given name.
 *
 * @param asset The asset to register.
 * @returns The asset ID.
 */
export function registerAsset(asset: RegisterableAsset): AssetId {
    if (cache[asset.name]?.[asset.type] !== undefined)
        throw new Error(
            `Asset with name ${asset.name} and type ${asset.type} already exists!`,
        )

    _customs.add(asset)

    // @ts-expect-error
    return AssetRegistry.registerAsset(asset)
}

/**
 * Override an asset with a custom asset.
 *
 * @param asset The asset to override.
 * @param override The custom asset to override with.
 */
export function addAssetOverride(asset: Asset, override: Asset) {
    _overrides.set(asset, override)
}

/**
 * Remove an asset override.
 *
 * @param asset The asset to remove the override for.
 * @returns The asset that was removed.
 */
export function removeAssetOverride(asset: Asset) {
    return _overrides.delete(asset)
}
