import { waitForModules } from '../../finders'
import { byProps } from '../../finders/filters'

import type { DiscordModules } from '../../../types'

waitForModules(byProps<DiscordModules.Flux.Store>('_dispatchToken'), (_, store) => {
    const name = store.getName()
    _stores[name] = store
})

const _stores: Record<string, any> = {}

export const stores = new Proxy(_stores, {
    ownKeys: () => Reflect.ownKeys(_stores),
    get: (_, name) => Reflect.get(_stores, name),
})
