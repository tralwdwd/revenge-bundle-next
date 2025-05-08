import type { Metro } from '@revenge-mod/modules/types'
import type { Asset, AssetId } from './types'

export const _assets = new Map<string, [first: Asset, all: Record<Asset['type'], Asset>]>()
export const _overrides = new Map<string, Asset>()
export const _metas = new WeakMap<Asset, [assetId: AssetId, moduleId: Metro.ModuleID]>()
