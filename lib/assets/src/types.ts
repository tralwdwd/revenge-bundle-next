import type { Metro } from '@revenge-mod/modules/types'
import type { ReactNative } from '@revenge-mod/react/types'

export type Asset = PackagerAsset | CustomAsset
export type AssetId = number

export type PackagerAsset = ReactNative.AssetsRegistry.PackagerAsset
export interface CustomAsset
    extends Pick<PackagerAsset, 'name' | 'width' | 'height' | 'type' | 'id'> {
    uri: string
    moduleId?: undefined
}

export type RegisterableAsset = Omit<CustomAsset, 'id'>

export type OnAssetsRegistryInitializedCallback = () => void

declare module '@revenge-mod/react/types' {
    export namespace ReactNative {
        export namespace AssetsRegistry {
            export interface PackagerAsset {
                id: AssetId
                moduleId: Metro.ModuleID
            }
        }
    }
}
