import { lookupModule, lookupModuleId } from '@revenge-mod/modules/finders'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'

import type { DiscordModules } from '../../types'

// ../discord_common/js/packages/flux
export * as flux from './flux'

// ../discord_common/js/shared/Logger.tsx
export const Logger = lookupModule(byName<DiscordModules.Logger>('Logger'))!
// ../discord_common/js/packages/tokens/native.tsx
export const tokensModuleId = lookupModuleId(byProps('RawColor'))!
export const tokens = __r(tokensModuleId)

export { AppStartPerformance } from '../preinit'
