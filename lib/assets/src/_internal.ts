import type { Asset, AssetId } from '.'

export const _assets = new Map<string, [first: Asset, all: Record<Asset['type'], Asset>]>()
export const _overrides = new Map<string, Asset>()
export const _ids = new WeakMap<Asset, AssetId>()
