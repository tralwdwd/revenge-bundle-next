import { _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperties } from '@revenge-mod/utils/objects'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiExternals } from './types'

defineLazyProperties(
    ((_uapi as UnscopedInitPluginApi).externals = {} as PluginApiExternals),
    {
        Browserify: () => require('@revenge-mod/externals/browserify'),
        ReactNativeClipboard: () =>
            require('@revenge-mod/externals/react-native-clipboard'),
        ReactNavigation: () =>
            require('@revenge-mod/externals/react-navigation'),
        Shopify: () => require('@revenge-mod/externals/shopify'),
    },
)
