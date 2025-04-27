import { lookupModule } from '../../finders'
import { byName, byProps } from '../../finders/filters'

import type { DiscordModules } from '../../../types/discord'

export * as flux from './flux'

// ../discord_common/js/shared/Logger.tsx
export const Logger = lookupModule(byName<DiscordModules.Logger>('Logger'))!
// ../discord_common/js/packages/tokens/native.tsx
export const tokens = lookupModule(byProps('RawColor'))!
