import { _plugins, preInitPlugin } from './_internal'
import { PluginFlags } from './constants'

for (const plugin of _plugins.values()) if (plugin.flags & PluginFlags.Enabled) preInitPlugin(plugin)
