import { ReactNative } from '@revenge-mod/react'

import { _assets, _ids, _overrides } from './_internal'
import { AssetRegistry } from './patches'

import type { ReactNative as RN } from '@revenge-mod/types'

export type Asset = ReactNativeAsset | RevengeAsset
export type AssetId = number

export type ReactNativeAsset = RN.AssetsRegistry.PackagerAsset
export interface RevengeAsset extends Pick<ReactNativeAsset, 'name' | 'width' | 'height' | 'type'> {
    uri: string
}

export type RegisterableAsset = Omit<RevengeAsset, 'id'>

// iOS cannot display SVGs
let _preferredType: Asset['type'] = ReactNative.Platform.OS === 'ios' ? 'png' : 'svg'

/**
 * Get an asset by its ID. **This may throw an error if the asset-registry has not been initialized.**
 *
 * @param id The asset ID.
 */
export function getAssetById(id: AssetId): Asset | undefined {
    return AssetRegistry.getAssetByID(id)
}

/**
 * Get the ID of an asset.
 *
 * @param asset The asset to get the ID for.
 */
export function getAssetId(asset: Asset) {
    return _ids.get(asset)
}

/**
 * Get an asset by its name.
 * If more than one asset is registered with the same name, this will return the one with the preferred type, or the first registered one.
 *
 * @param name The asset name.
 */
export function getAssetByName(name: string): Asset | undefined {
    const reg = _assets.get(name)
    if (!reg) return

    return _overrides.get(name) ?? reg[1][_preferredType] ?? reg[0]
}

/**
 * Gets all assets matching the name.
 *
 * @param name The asset name.
 * @returns A record keyed by the type of the asset, with the value being the asset itself.
 */
export function getAssetsByName(name: string): Record<Asset['type'], Asset> | undefined {
    return _assets.get(name)?.[1]
}

/**
 * Set the preferred asset type. This is used to determine which asset to use when multiple types are available.
 *
 * @param type The preferred asset type.
 */
export function setPreferredAssetType(type: Asset['type']) {
    _preferredType = type
}

/**
 * Register an asset with the given name.
 * If an asset with the same name already exists, it will be overridden if `override` is set to true.
 *
 * @param asset The asset to register.
 * @param override Whether to override the existing asset if one exists. `false` by default.
 * @throws An error if an asset with the same name and type already exists and `override` is not set to true.
 */
export function registerAsset(asset: RegisterableAsset, override?: boolean) {
    const { name, type } = asset

    if (override) _overrides.set(name, asset)
    // Make sure to not override the asset if it already exists, unless explicitly set to override
    else if (_assets.get(name)?.[1]?.[type]) throw new Error(`Asset "${name}" with type "${type}" already exists`)

    // @ts-expect-error
    return AssetRegistry.registerAsset(asset)
}

/**
 * Remove an asset override.
 *
 * @param name The name of the asset to remove the override for.
 * @returns Whether the override was removed.
 */
export function removeAssetOverride(name: string) {
    return _overrides.delete(name)
}
