import { getAssetByName } from '@revenge-mod/assets'
import { TokensModuleId } from '@revenge-mod/discord/common'
import { byDependencies, byProps } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import {
    ReactJsxRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@revenge-mod/react'
import type { FC } from 'react'

// [React, ReactJsxRuntime, (Tokens), (BaseIconImage), (Asset), 2]
// Asset = relativeDep(1)
const IconComponentFilter = [
    ReactModuleId,
    ReactJsxRuntimeModuleId,
    TokensModuleId,
    undefined,
    undefined,
    2,
]

// Generated IconComponents that have multiple assets, there is no specific length, so the filter has to be generated on-the-fly.
// [React, ReactNative, ReactJsxRuntime, (Tokens), (BaseIconImage), (...Assets), 2]
// ...Assets = relativeDep(1..n)
const MultiIconComponentFilterBase = [
    ReactModuleId,
    ReactNativeModuleId,
    ReactJsxRuntimeModuleId,
    TokensModuleId,
    undefined,
]

// TODO(utils/discord/lookupGeneratedIconComponent): Make this into a filter?
export function lookupGeneratedIconComponent<N extends string>(
    compName: N,
    ...assetNames: string[]
) {
    const icon = lookupModule(byProps(compName))[0]?.[compName]
    if (icon) return icon

    let filter = IconComponentFilter

    if (assetNames.length) {
        const mids = []

        for (const name of assetNames) {
            const mid = getAssetByName(name)?.moduleId
            if (!mid) return

            mids.push(mid)
        }

        filter = [...MultiIconComponentFilterBase, ...mids, 2]
    } else {
        const mid = getAssetByName(compName)?.moduleId
        if (!mid) return

        IconComponentFilter[4] = mid
    }

    return lookupModule(byDependencies<{ [K in N]: FC }>(filter), {
        initialized: false,
        uninitialized: true,
    })[0]?.[compName]
}
