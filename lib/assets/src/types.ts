import type { ReactNative } from '@revenge-mod/react/types'

export type Asset = ReactNativeAsset | RevengeAsset
export type AssetId = number

export type ReactNativeAsset = ReactNative.AssetsRegistry.PackagerAsset
export interface RevengeAsset
    extends Pick<ReactNativeAsset, 'name' | 'width' | 'height' | 'type'> {
    uri: string
}

export type RegisterableAsset = Omit<RevengeAsset, 'id'>
