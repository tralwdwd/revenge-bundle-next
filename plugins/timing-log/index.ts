import { AppStartPerformance } from '@revenge-mod/discord'

import { PluginFlags } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

AppStartPerformance.mark('👊', 'Plugins register')

const tsReg = performance.now()
let tsInit: number

registerPlugin(
    {
        id: 'revenge.timing-log',
        name: 'Startup Timing Log',
        description: "Log Revenge's startup timing into Discord's Startup Timing",
    },
    {
        init() {
            tsInit = performance.now()
            AppStartPerformance.mark('👊', 'Plugins init', tsInit - tsReg)
        },
        start() {
            AppStartPerformance.mark('👊', 'Plugins start', performance.now() - tsInit)
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
