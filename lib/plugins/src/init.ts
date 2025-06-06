import * as AssetsLibrary from '@revenge-mod/assets'
import { onRunApplication } from '@revenge-mod/react/native'
import { _plugins, initPlugin, startPlugin } from './_internal'
import { _uapi } from './apis'
import { react } from './apis/react'
import { PluginFlags } from './constants'
import type { UnscopedInitPluginApi } from './types'

// Setup init plugin APIs
const uapi = _uapi as UnscopedInitPluginApi
uapi.assets = AssetsLibrary
uapi.react = react

for (const plugin of _plugins.values())
    if (plugin.flags & PluginFlags.Enabled) initPlugin(plugin)

const unsub = onRunApplication(() => {
    unsub()

    // TODO(plugins/start): init start APIs
    // const UILibrary = require('@revenge-mod/ui')
    // uapi.ui = UiLibrary

    for (const plugin of _plugins.values())
        if (plugin.flags & PluginFlags.Enabled) startPlugin(plugin)
})
