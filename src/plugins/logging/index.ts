import { AppStartPerformance } from '@revenge-mod/discord/common'

import { PluginFlags } from '@revenge-mod/plugins/constants'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

AppStartPerformance.mark('👊', 'Plugins register')

const tsReg = performance.now()
let tsInit: number

registerPlugin(
    {
        id: 'revenge.logging',
        name: 'Logging',
        description: "Extra logging for Revenge's internal modules",
        author: 'Revenge',
        icon: 'PaperIcon',
    },
    {
        init() {
            tsInit = performance.now()
            AppStartPerformance.mark('👊', 'Plugins init', tsInit - tsReg)
        },
        start({ logger }) {
            AppStartPerformance.mark('👊', 'Plugins start', performance.now() - tsInit)
            logger.log(
                `👊 Revenge. Discord, your way. (${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${__BUILD_ENV__}))`,
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
