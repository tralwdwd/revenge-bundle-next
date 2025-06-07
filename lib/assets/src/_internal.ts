import type { Asset, CustomAsset } from './types'

export const _customs = new Set<CustomAsset>()
export const _overrides = new WeakMap<Asset, Asset>()
