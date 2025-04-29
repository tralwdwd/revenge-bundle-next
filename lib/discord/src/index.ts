import { lookupModule } from '@revenge-mod/modules/finders'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'

import type { DiscordModules } from '@revenge-mod/modules/types/discord'

export * as flux from './flux'

// ../discord_common/js/shared/Logger.tsx
export const Logger = lookupModule(byName<DiscordModules.Logger>('Logger'))!
// ../discord_common/js/packages/tokens/native.tsx
export const tokens = lookupModule(byProps('RawColor'))!
