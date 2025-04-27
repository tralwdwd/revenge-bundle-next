import { ReactNative } from '@revenge-mod/modules/common/react'

import { _assets } from './_internal'
import { AssetRegistry } from './patches'

import type { ReactNative as RN } from '@revenge-mod/types'

export type Asset = RN.AssetsRegistry.PackagerAsset
export type AssetId = number

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
 * Get an asset by its name.
 * If more than one asset is registered with the same name, this will return the one with the preferred type, or the first registered one.
 *
 * @param name The asset name.
 */
export function getAssetByName(name: string): Asset | undefined {
    const reg = _assets.get(name)
    if (!reg) return

    return reg[1][_preferredType] ?? reg[0]
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
