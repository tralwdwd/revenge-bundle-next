import {
    byDependencies,
    byProps,
    every,
    preferExports,
    withoutProps,
} from '@revenge-mod/modules/finders/filters'
import {
    lookupModule,
    lookupModules,
} from '@revenge-mod/modules/finders/lookup'
import {
    ReactJsxRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@revenge-mod/react'
import { proxify } from '@revenge-mod/utils/proxy'
import { DispatcherModuleId } from './common/flux'
import type { DiscordModules } from './types'

const { relative } = byDependencies

export let ActionSheetActionCreators: DiscordModules.Actions.ActionSheetActionCreators =
    proxify(
        () => {
            const [module] = lookupModule(
                preferExports(
                    byProps<DiscordModules.Actions.ActionSheetActionCreators>(
                        'hideActionSheet',
                        'openLazy',
                    ),
                    byDependencies([
                        undefined,
                        ReactModuleId,
                        ReactJsxRuntimeModuleId,
                        DispatcherModuleId,
                        relative(1),
                        relative(2),
                        2,
                    ]),
                ),
                {
                    includeUninitialized: true,
                },
            )

            if (module) return (ActionSheetActionCreators = module)
        },
        {
            hint: 'object',
        },
    )!

export let AlertActionCreators: DiscordModules.Actions.AlertActionCreators =
    proxify(
        () => {
            const [module] = lookupModule(
                preferExports(
                    byProps<DiscordModules.Actions.AlertActionCreators>(
                        'openAlert',
                    ),
                    byDependencies([
                        [[], relative(1)],
                        [ReactNativeModuleId, 2],
                        2,
                    ]),
                ),
            )

            if (module) return (AlertActionCreators = module)
        },
        {
            hint: 'object',
        },
    )!

export let ToastActionCreators: DiscordModules.Actions.ToastActionCreators =
    proxify(() => {
        // Many other modules share the same dependencies, the second yielded should be the correct module.
        // [Dispatcher, ImportTracker]

        const generator = lookupModules(
            preferExports(
                every(
                    byProps<DiscordModules.Actions.ToastActionCreators>('open'),
                    withoutProps('init'),
                ),
                byDependencies([DispatcherModuleId, 2]),
            ),
            {
                includeUninitialized: true,
            },
        )

        for (const [module] of generator)
            if (module.open.length === 1) return (ToastActionCreators = module)
    })!
