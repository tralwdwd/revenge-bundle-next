import { startPlugin } from './_internal'
import { computePendingNodes, pListOrdered } from './_internal/dependency-graph'
import { PluginFlags } from './constants'

computePendingNodes()

if (__DEV__)
    nativeLoggingHook(
        `\u001b[32mStarting plugins: ${pListOrdered.map(x => `\u001b[33m${x.manifest.id}\u001b[0m`).join(' -> ')}\u001b[0m`,
        1,
    )

for (const plugin of pListOrdered)
    if (plugin.flags & PluginFlags.Enabled) startPlugin(plugin)
