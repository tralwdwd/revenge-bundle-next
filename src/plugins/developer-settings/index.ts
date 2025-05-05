import { type PluginApi, PluginFlags } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

import { _data } from '@revenge-mod/discord/_/ui/settings'
import { onceSettingsModulesLoaded } from '@revenge-mod/discord/ui/settings'

registerPlugin(
    {
        id: 'revenge.settings.developer',
        name: 'Developer Settings',
        description: 'Developer settings menus for Revenge',
        author: 'Revenge',
        icon: 'WrenchIcon',
    },
    {
        start(api) {
            pluginApi = api
            onceSettingsModulesLoaded(() => require('./register'))
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)

// Expose to EvaluateJavaScriptSetting
export let pluginApi: PluginApi
