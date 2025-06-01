import {
    type Filter,
    byDependencies,
    byProps,
    createFilterGenerator,
    preferExports,
    relativeDep,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { waitForModules } from '@revenge-mod/modules/finders/wait'
import { noopFalse } from '@revenge-mod/utils/callbacks'

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

export function getStore<T>(name: string, callback: (store: DiscordModules.Flux.Store<T>) => void) {
    const store = Stores[name]
    if (store) {
        callback(store)
        return noopFalse
    }

    return waitForModules(byStoreName<T>(name), callback)
}

export type ByStoreName = <T>(name: string) => Filter<DiscordModules.Flux.Store<T>>

export const byStoreName = createFilterGenerator<[name: string]>(
    ([name], _, exports) => exports.getName?.length === 0 && exports.getName() === name,
    ([name]) => `revenge.discord.byStoreName(${name})`,
) as ByStoreName
