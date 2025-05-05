import { lookupModule, lookupModules } from '@revenge-mod/modules/finders'
import {
    byDependencies,
    byProps,
    every,
    moduleStateAware,
    relativeDep,
    withoutProps,
} from '@revenge-mod/modules/finders/filters'

import { ReactJsxRuntimeModuleId, ReactModuleId } from '@revenge-mod/react'

import { proxify } from '@revenge-mod/utils/proxy'

import type { DiscordModules } from '../types'

export let AlertActionCreators: DiscordModules.Actions.AlertActionCreators = proxify(
    () => {
        // ID: 3667
        // [175, 180, 2553, 684, 1249, 3668, 1675, 2]
        const module = lookupModule(
            moduleStateAware(
                byProps<DiscordModules.Actions.AlertActionCreators>('openAlert', 'dismissAlert'),
                byDependencies([
                    ReactModuleId,
                    ReactJsxRuntimeModuleId,
                    undefined,
                    undefined,
                    relativeDep(1),
                    undefined,
                    2,
                ]),
            ),
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            AlertActionCreators = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!

export let ToastActionCreators: DiscordModules.Actions.ToastActionCreators = proxify(() => {
    // Many other modules share the same dependencies, the second yielded should be the correct module.
    // [684, 2]

    // Dispatcher.tsx (ID: 684)
    // [685, 652, 606, 585, 806, 2]

    const generator = lookupModules(
        moduleStateAware(
            every(byProps<DiscordModules.Actions.ToastActionCreators>('open'), withoutProps('init')),
            byDependencies([[relativeDep(1), undefined, undefined, undefined, undefined, 2], 2]),
        ),
        {
            includeUninitialized: true,
        },
    )

    for (const module of generator)
        if (module.open.length === 1) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            ToastActionCreators = module
            gc()
            return module
        }
})!
