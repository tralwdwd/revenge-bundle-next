import { lookupModule } from '@revenge-mod/modules/finders'
import { byDependencies, byProps, looseDeps, moduleStateAware, relativeDep } from '@revenge-mod/modules/finders/filters'

import { ReactJsxRuntimeModuleId, ReactModuleId, ReactNativeModuleId } from '@revenge-mod/react'

import { proxify } from '@revenge-mod/utils/proxy'

import type { ComponentType, ReactNode } from 'react'

export let SettingListRenderer: SettingListRenderer = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(
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

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            SettingListRenderer = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!

export interface SettingListRenderer {
    SettingsList: ComponentType<{
        ListHeaderComponent?: ComponentType
        sections: Array<{ label?: string | ReactNode; settings: string[]; subLabel?: string | ReactNode }>
    }>
}
