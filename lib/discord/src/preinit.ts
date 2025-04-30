import { byDependencies, byProps, moduleStateAware } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders'

import type { DiscordModules } from '../types'

// ../discord_common/js/shared/AppStartPerformance.tsx
export const AppStartPerformance = lookupModule(
    moduleStateAware(
        byProps<DiscordModules.AppStartPerformance>('markAndLog'),
        // biome-ignore lint/suspicious/noSparseArray: Nah
        byDependencies([-1, , , 2]),
    ),
    {
        includeUninitialized: true,
    },
)!

AppStartPerformance.mark('👊', 'Preinit')
