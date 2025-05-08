import { lookupModule } from '@revenge-mod/modules/finders'
import { byDependencies, byProps, moduleStateAware, relativeDep } from '@revenge-mod/modules/finders/filters'
import { proxify } from '@revenge-mod/utils/proxy'

export let nodeUtil: typeof import('node:util') = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(byProps<typeof nodeUtil>('inspect'), byDependencies([relativeDep(1), [], []])),
            {
                includeUninitialized: true,
            },
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            nodeUtil = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!
