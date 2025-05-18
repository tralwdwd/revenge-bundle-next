import { byDependencies, byProps, preferExports, relativeDep } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'

import type { Metro } from '@revenge-mod/modules/types'
import type { DiscordModules } from './types'

// ../discord_common/js/shared/AppStartPerformance.tsx
export const [AppStartPerformance] = lookupModule(
    preferExports(
        byProps<DiscordModules.AppStartPerformance>('markAndLog'),
        byDependencies([relativeDep(-1), undefined, undefined, 2]),
    ),
    {
        includeUninitialized: true,
    },
) as [DiscordModules.AppStartPerformance, Metro.ModuleID]

AppStartPerformance.mark('👊', 'Pre-init')
