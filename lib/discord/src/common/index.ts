import { byName, byProps } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import type { Metro } from '@revenge-mod/modules/types'
import type { DiscordModules } from '../types'

export { AppStartPerformance } from '../preinit'
export * as Flux from './flux'

// ../discord_common/js/shared/Logger.tsx
export const [Logger] = lookupModule(
    byName<DiscordModules.Logger>('Logger'),
) as [DiscordModules.Logger, Metro.ModuleID]

// ../discord_common/js/packages/tokens/native.tsx
export const [Tokens, TokensModuleId] = lookupModule(byProps('RawColor')) as [
    any,
    Metro.ModuleID,
]
