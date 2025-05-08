import { proxify } from '@revenge-mod/utils/proxy'
import { lookupModule, lookupModuleId } from '@revenge-mod/modules/finders'
import { byDependencies, byName, byProps, looseDeps, moduleStateAware } from '@revenge-mod/modules/finders/filters'

const _createClassModuleId = lookupModuleId(byName('_createClass'))
const _classCallCheckModuleId = lookupModuleId(byName('_classCallCheck'))

export let ReactNavigationNative: typeof import('@react-navigation/native') = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(
                byProps<typeof ReactNavigationNative>('useLinkTo'),
                byDependencies(looseDeps([[], looseDeps([[_createClassModuleId, _classCallCheckModuleId]])])),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            ReactNavigationNative = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!

export let ReactNavigationStack: typeof import('@react-navigation/stack') = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(
                byProps<typeof ReactNavigationStack>('createStackNavigator'),
                byDependencies(looseDeps([[], looseDeps([[_createClassModuleId, _classCallCheckModuleId]])])),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            ReactNavigationStack = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!

export interface ReactNavigationParamList {
    [Page: string]: any
}

declare global {
    namespace ReactNavigation {
        interface RootParamList extends ReactNavigationParamList {}
    }
}
