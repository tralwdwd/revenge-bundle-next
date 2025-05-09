import { byName, byProps } from '@revenge-mod/modules/finders/filters'
import { lookupModule, lookupModuleId } from '@revenge-mod/modules/finders/lookup'

import type { DiscordModules } from '../types'

export { AppStartPerformance } from '../preinit'

export * as Flux from './flux'

// ../discord_common/js/shared/Logger.tsx
export const Logger = lookupModule(byName<DiscordModules.Logger>('Logger'))!

// ../discord_common/js/packages/tokens/native.tsx
export const TokensModuleId = lookupModuleId(byProps('RawColor'))!
export const Tokens = __r(TokensModuleId)
