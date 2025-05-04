import { proxify } from '@revenge-mod/utils/proxy'
import { lookupModule } from '../../modules/src/finders/lookup'
import { byDependencies, byProps, moduleStateAware, relativeDep } from '@revenge-mod/modules/finders/filters'
import type { DiscordModules } from '../types'
import { ReactJsxRuntimeModuleId, ReactModuleId } from '@revenge-mod/react'

export let AlertActionCreators: DiscordModules.Actions.AlertActionCreators = proxify(
    () => {
        // ID: 3667
        // [175, 180, 2553, 684, 1249, 3668, 1675, 2]
        const module = lookupModule(
            moduleStateAware(
                byProps<DiscordModules.Actions.AlertActionCreators>('openAlert', 'dismissAlert'),
                byDependencies([
                    ReactModuleId,
                    ReactJsxRuntimeModuleId,
                    undefined,
                    undefined,
                    relativeDep(1),
                    undefined,
                    2,
                ]),
            ),
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            AlertActionCreators = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!
