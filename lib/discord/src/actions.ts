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

import { DispatcherModuleId } from './common/flux'

import type { DiscordModules } from '../types'

export let ActionSheetActionCreators: DiscordModules.Actions.ActionSheetActionCreators = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(
                byProps<DiscordModules.Actions.ActionSheetActionCreators>('hideActionSheet'),
                byDependencies([
                    undefined,
                    ReactModuleId,
                    ReactJsxRuntimeModuleId,
                    DispatcherModuleId,
                    relativeDep(1),
                    relativeDep(2),
                    2,
                ]),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            ActionSheetActionCreators = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!

export let AlertActionCreators: DiscordModules.Actions.AlertActionCreators = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(
                byProps<DiscordModules.Actions.AlertActionCreators>('openAlert', 'dismissAlert'),
                byDependencies([
                    ReactModuleId,
                    ReactJsxRuntimeModuleId,
                    undefined,
                    DispatcherModuleId,
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
    // [Dispatcher, ImportTracker]

    const generator = lookupModules(
        moduleStateAware(
            every(byProps<DiscordModules.Actions.ToastActionCreators>('open'), withoutProps('init')),
            byDependencies([DispatcherModuleId, 2]),
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
