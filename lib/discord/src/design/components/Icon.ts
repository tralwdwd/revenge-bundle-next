import { getAssetByName, getAssetModuleId } from '@revenge-mod/assets'

import { lookupModule } from '@revenge-mod/modules/finders'
import { byDependencies, byProps } from '@revenge-mod/modules/finders/filters'

import { ReactJsxRuntimeModuleId, ReactModuleId } from '@revenge-mod/react'

import { tokensModuleId } from '../../common'

import type { FC } from 'react'

// [React, ReactJsxRuntime, (BaseIconImage), (Tokens), (Asset), 2]
// Asset = relativeDep(1)
const filter = [ReactModuleId, ReactJsxRuntimeModuleId, tokensModuleId, undefined, undefined, 2]

export function lookupGeneratedIconComponent<N extends string>(name: N) {
    const icon = lookupModule(byProps(name))?.[name]
    if (icon) return icon

    const mid = getAssetModuleId(getAssetByName(name)!)!
    if (!mid) return

    filter[4] = mid

    return lookupModule(byDependencies<{ [K in N]: FC }>(filter), {
        includeInitialized: false,
        includeUninitialized: true,
    })?.[name]
}
