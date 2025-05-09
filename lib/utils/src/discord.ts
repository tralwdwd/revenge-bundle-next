import { getAssetByName, getAssetModuleId } from '@revenge-mod/assets'
import { TokensModuleId } from '@revenge-mod/discord/common'

import { byDependencies, byProps } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'

import { ReactJsxRuntimeModuleId, ReactModuleId } from '@revenge-mod/react'

import type { FC } from 'react'

// [React, ReactJsxRuntime, (BaseIconImage), (Tokens), (...), (Asset), 2]
// Asset = relativeDep(1)
const IconComponentFilter = [ReactModuleId, ReactJsxRuntimeModuleId, TokensModuleId, undefined, undefined, 2]

export function lookupGeneratedIconComponent<N extends string>(name: N) {
    const icon = lookupModule(byProps(name))?.[name]
    if (icon) return icon

    const mid = getAssetModuleId(getAssetByName(name)!)!
    if (!mid) return

    IconComponentFilter[4] = mid

    return lookupModule(byDependencies<{ [K in N]: FC }>(IconComponentFilter), {
        includeInitialized: false,
        includeUninitialized: true,
    })?.[name]
}
