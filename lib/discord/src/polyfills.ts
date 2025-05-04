import { lookupModule } from '@revenge-mod/modules/finders'
import { byDependencies, byProps, moduleStateAware, relativeDep } from '@revenge-mod/modules/finders/filters'

export const nodeUtils = lookupModule(moduleStateAware(byProps('inspect'), byDependencies([relativeDep(1), [], []])), {
    includeInitialized: false,
    includeUninitialized: true,
})! as typeof import('node:util')
