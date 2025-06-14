import {
    byDependencies,
    byName,
    preferExports,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { proxify } from '@revenge-mod/utils/proxy'
import type { DiscordModules } from '../types'

const [, _createClassModuleId] = lookupModule(byName('_createClass'))
const [, _classCallCheckModuleId] = lookupModule(byName('_classCallCheck'))

export let TypedEventEmitter: typeof DiscordModules.Utils.TypedEventEmitter =
    proxify(() => {
        const [module] = lookupModule(
            preferExports(
                byName<typeof DiscordModules.Utils.TypedEventEmitter>(
                    'TypedEventEmitter',
                ),
                byDependencies([
                    _classCallCheckModuleId,
                    _createClassModuleId,
                    [],
                    2,
                ]),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) return (TypedEventEmitter = module)
    })!
