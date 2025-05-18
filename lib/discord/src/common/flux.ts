import { byDependencies, byProps, preferExports, relativeDep } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { waitForModules } from '@revenge-mod/modules/finders/wait'

import type { Metro } from '@revenge-mod/modules/types'
import type { DiscordModules } from '../types'

// ../discord_common/js/packages/flux

export const [Dispatcher, DispatcherModuleId] = lookupModule(
    preferExports(
        byProps<DiscordModules.Flux.Dispatcher>('_interceptors'),
        byDependencies([relativeDep(1), undefined, undefined, undefined, undefined, 2]),
    ),
    {
        includeUninitialized: true,
    },
) as [DiscordModules.Flux.Dispatcher, Metro.ModuleID]

waitForModules(byProps<DiscordModules.Flux.Store>('_dispatchToken'), store => {
    const name = store.getName()
    _stores[name] = store
})

const _stores: Record<string, any> = {}

export const Stores = new Proxy(_stores, {
    ownKeys: () => Reflect.ownKeys(_stores),
    get: (_, name) => _stores[name as string],
})
