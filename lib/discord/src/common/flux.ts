import { lookupModuleId, waitForModules } from '@revenge-mod/modules/finders'
import { byDependencies, byProps, moduleStateAware, relativeDep } from '@revenge-mod/modules/finders/filters'

import type { DiscordModules } from '../../types'

export const DispatcherModuleId = lookupModuleId(
    moduleStateAware(
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

export const stores = new Proxy(_stores, {
    ownKeys: () => Reflect.ownKeys(_stores),
    get: (_, name) => stores[name as string],
})
