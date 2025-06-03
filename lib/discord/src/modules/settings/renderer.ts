import {
    byDependencies,
    byProps,
    looseDeps,
    preferExports,
    relativeDep,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import {
    ReactJsxRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@revenge-mod/react'
import { proxify } from '@revenge-mod/utils/proxy'
import type { DiscordModules } from '../../types'

export type SettingListRenderer =
    DiscordModules.Modules.Settings.SettingListRenderer

export let SettingListRenderer: SettingListRenderer = proxify(
    () => {
        const [module] = lookupModule(
            preferExports(
                byProps<SettingListRenderer>('SettingsList'),
                byDependencies(
                    looseDeps([
                        ReactModuleId,
                        ReactNativeModuleId,
                        relativeDep(1),
                        relativeDep(2),
                        undefined,
                        ReactJsxRuntimeModuleId,
                    ]),
                ),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) return (SettingListRenderer = module)
    },
    {
        hint: 'object',
    },
)!
