import { _initing, _uninits } from '@revenge-mod/modules/_/metro'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'
import { getModuleDependencies } from '@revenge-mod/modules/metro/utils'

import { _assets, _metas, _overrides } from './_internal'

import type { ReactNative } from '@revenge-mod/react/types'
import type { Asset, ReactNativeAsset } from './types'

export let AssetRegistry: ReactNative.AssetsRegistry
export let AssetRegistryModuleId: number

// Tracking/caching assets
const unsubAR = waitForModules(byProps<ReactNative.AssetsRegistry>('registerAsset'), (id, exports) => {
    AssetRegistryModuleId = id
    AssetRegistry = exports as ReactNative.AssetsRegistry

    // There are two matching exports. One is the original, and one is a re-export.
    // The original asset-registry is simply required by the re-exported one with no changes.

    // This is the re-exported registry, because it has dependencies.
    // We can begin the caching process here, asset registrar modules have the reexported registry as a dependency.
    if (getModuleDependencies(id)!.length) {
        unsubAR()

        // TODO(assets/patches): conditionally run this if cache does not exist
        // More fragile way, but also more performant:
        // There is exactly one asset before the reexported asset registry :/
        const firstAssetModuleId = id - 1
        for (const mId of _uninits) {
            if (mId < firstAssetModuleId) continue

            const deps = getModuleDependencies(mId)!
            if (deps.length === 1 && deps[0] === id) __r(mId)
        }

        // We already patched the original asset registry, so we don't need to patch again.
        return
    }

    const orig = exports.registerAsset
    exports.registerAsset = (asset: Asset) => {
        const result = orig(asset as ReactNativeAsset)

        const { name, type } = asset

        let reg = _assets.get(name)
        if (!reg) {
            reg = [asset, {}]
            _assets.set(name, reg)
        }

        // In-memory cache
        reg[1][type] = asset
        _metas.set(asset, [result, _initing])

        return result
    }
})

// Asset overrides
const unsubRAS = waitForModules(
    byName<{
        addCustomSourceTransformer: (transformer: (arg: { asset: Asset }) => ReactNativeAsset) => void
    }>('resolveAssetSource'),
    (_, rAS) => {
        unsubRAS()

        // Custom assets
        // Why do we need to do this? Because RN/Dicord (unsure which) will attempt to resolve the asset via its path, which we don't provide via custom assets.
        // This will result in a crash, because it tries to read the path and run checks on it, but the path is undefined.
        // @ts-expect-error
        rAS.addCustomSourceTransformer(({ asset }) => {
            // @ts-expect-error
            if (!asset.__packager_asset) return asset
        })

        // Asset overrides
        // @ts-expect-error
        rAS.addCustomSourceTransformer(({ asset }) => _overrides.get(asset.name))
    },
)
