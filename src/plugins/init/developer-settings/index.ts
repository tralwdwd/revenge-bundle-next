import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'

import { _data } from '@revenge-mod/discord/_/modules/settings'
import { isSettingsModulesLoaded, onSettingsModulesLoaded } from '@revenge-mod/discord/modules/settings'

import type { PluginApi } from '@revenge-mod/plugins/types'

interface Storage {
    devtools: {
        address: string
        autoConnect: boolean
    }
}

const defaultStorage: Storage = {
    devtools: {
        address: 'localhost:8097',
        autoConnect: false,
    },
}

registerPlugin<Storage>(
    {
        id: 'revenge.settings.developer',
        name: 'Developer Settings',
        description: 'Developer settings menus for Revenge',
        author: 'Revenge',
        icon: 'WrenchIcon',
    },
    {
        storage: {
            load: true,
            default: defaultStorage,
        },
        start(api_) {
            api = api_

            if (isSettingsModulesLoaded()) require('./register').register()
            else onSettingsModulesLoaded(() => require('./register').register())

            api.storage.get().then(settings => {
                if (settings.devtools.autoConnect) import('./react-devtools').then(it => it.connectToDevTools())
            })
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)

// Expose to EvaluateJavaScriptSetting
export let api: PluginApi<Storage>
