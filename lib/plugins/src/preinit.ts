import { pList, preInitPlugin } from './_internal'
import { PluginFlags } from './constants'

for (const plugin of pList.values())
    if (plugin.flags & PluginFlags.Enabled) preInitPlugin(plugin)
