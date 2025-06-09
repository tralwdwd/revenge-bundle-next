import {
    byDependencies,
    byName,
    byProps,
    every,
    looseDeps,
    preferExports,
    relativeDep,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { proxify } from '@revenge-mod/utils/proxy'
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

const OnlyImportTrackerDep = [2]

export let Constants: DiscordModules.Constants = proxify(
    () => {
        const [module] = lookupModule(
            preferExports(
                byProps<DiscordModules.Constants>('ME'),
                every(
                    // ID:   1236
                    // Deps: 26, 1237, 1238, 1239, 1240, ...
                    // Every module has only one dependency, which is the import tracker
                    byDependencies(
                        looseDeps([
                            undefined,
                            relativeDep(1),
                            relativeDep(2),
                            relativeDep(3),
                            relativeDep(4),
                        ]),
                    ),
                    byDependencies(
                        looseDeps(new Array(5).fill(OnlyImportTrackerDep)),
                    ),
                ),
            ),
        )

        if (module) return (Constants = module)
    },
    { hint: 'object' },
)!
