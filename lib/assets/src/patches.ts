import { _mUninited } from '@revenge-mod/modules/_/metro'
import { waitForModules } from '@revenge-mod/modules/finders'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'
import { getModuleDependencies } from '@revenge-mod/modules/metro'

import { _assets, _ids, _overrides } from './_internal'

import type { ReactNative } from '@revenge-mod/types'
import type { Asset, ReactNativeAsset } from '.'

export let AssetRegistry: ReactNative.AssetsRegistry
export let AssetRegistryModuleId: number

// Tracking/caching assets
const unsubForAssetRegistry = waitForModules(byProps('registerAsset'), (arId, exports) => {
    // We want to do caching only for the re-exported asset-registry
    if (!getModuleDependencies(arId)!.length) {
        AssetRegistry = exports as ReactNative.AssetsRegistry

        const orig = exports.registerAsset
        exports.registerAsset = function registerAsset(asset: Asset) {
            const { name, type } = asset

            // In-memory cache
            if (!_assets.has(name)) _assets.set(name, [asset, {}])
            const reg = _assets.get(name)!
            reg[1][type] = asset

            const result = orig(asset)
            _ids.set(asset, result)
            return result
        }

        return
    }

    unsubForAssetRegistry()
    AssetRegistryModuleId = arId

    // TODO(assets/patches): conditionally run this if cache does not exist
    // More fragile way, but more performant:
    // There is exactly one asset before the reexported asset registry, thanks Discord!
    const firstAssetModuleId = arId - 1
    for (const id of _mUninited) {
        if (id < firstAssetModuleId) continue

        const deps = getModuleDependencies(id)!
        if (deps.length === 1 && deps[0] === arId) __r(id)
    }
})

// Asset overrides
const unsubForResolveAssetSource = waitForModules(
    byName<{
        addCustomSourceTransformer: (transformer: (arg: { asset: Asset }) => ReactNativeAsset) => void
    }>('resolveAssetSource'),
    (_, resolveAssetSource) => {
        unsubForResolveAssetSource()

        // Custom assets
        // Why do we need to do this? Because RN will attempt to resolve the asset via its path, which we don't provide via custom assets.
        // This will result in a crash, because it tries to read the path and run checks on it, but the path is undefined.
        // @ts-expect-error
        resolveAssetSource.addCustomSourceTransformer(({ asset }) => {
            // @ts-expect-error
            if (!asset.__packager_asset) return asset
        })

        // Asset overrides
        // @ts-expect-error
        resolveAssetSource.addCustomSourceTransformer(({ asset }) => _overrides.get(asset.name))
    },
)
