import {
    isSettingsModulesLoaded,
    onSettingsModulesLoaded,
} from '@revenge-mod/discord/modules/settings'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
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
        async start(api_) {
            api = api_

            if (isSettingsModulesLoaded()) require('./register')
            else onSettingsModulesLoaded(() => require('./register'))

            const [rdt, settings] = await Promise.all([
                import('./react-devtools'),
                api.storage.get(),
            ])

            if (settings.devtools.autoConnect) rdt.connectToDevTools()
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)

// Expose to EvaluateJavaScriptSetting
export let api: PluginApi<Storage>
