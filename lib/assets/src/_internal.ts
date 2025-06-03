import type { Metro } from '@revenge-mod/modules/types'
import type { Asset, AssetId } from './types'

export const _customs = new Set<Asset>()
export const _overrides = new WeakMap<Asset, Asset>()
export const _metas = new WeakMap<
    Asset,
    [assetId: AssetId, moduleId: Metro.ModuleID]
>()
