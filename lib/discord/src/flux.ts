import { waitForModules } from '@revenge-mod/modules/finders'
import { byProps } from '@revenge-mod/modules/finders/filters'

import type { DiscordModules } from '@revenge-mod/modules/types/discord'

waitForModules(byProps<DiscordModules.Flux.Store>('_dispatchToken'), (_, store) => {
    const name = store.getName()
    _stores[name] = store
})

const _stores: Record<string, any> = {}

export const stores = new Proxy(_stores, {
    ownKeys: () => Reflect.ownKeys(_stores),
    get: (_, name) => stores[name as string],
})
