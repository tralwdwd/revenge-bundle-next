import { byDependencies, byProps, preferExports, relativeDep } from '@revenge-mod/modules/finders/filters'
import { lookupModuleId } from '@revenge-mod/modules/finders/lookup'
import { waitForModules } from '@revenge-mod/modules/finders/wait'

import type { DiscordModules } from '../types'

// ../discord_common/js/packages/flux

export const DispatcherModuleId = lookupModuleId(
    preferExports(
        byProps<DiscordModules.Flux.Dispatcher>('_interceptors'),
        byDependencies([relativeDep(1), undefined, undefined, undefined, undefined, 2]),
    ),
    {
        includeUninitialized: true,
    },
)

export const Dispatcher = __r(DispatcherModuleId!) as DiscordModules.Flux.Dispatcher

waitForModules(byProps<DiscordModules.Flux.Store>('_dispatchToken'), (_, store) => {
    const name = store.getName()
    _stores[name] = store
})

const _stores: Record<string, any> = {}

export const Stores = new Proxy(_stores, {
    ownKeys: () => Reflect.ownKeys(_stores),
    get: (_, name) => Stores[name as string],
})
