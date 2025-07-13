import type {
    Asset,
    CustomAsset,
    OnAssetsRegistryInitializedCallback,
} from './types'

export const aCustoms = new Set<CustomAsset>()
export const aOverrides = new WeakMap<Asset, Asset>()
export const aCallbacks = new Set<OnAssetsRegistryInitializedCallback>()
