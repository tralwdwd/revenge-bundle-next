import { _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiExternals } from './types'

const uapi = _uapi as UnscopedInitPluginApi
const externals = (uapi.externals = {} as PluginApiExternals)

// ROLLDOWN ISSUE: Requires us to do () => { return require(...) } instead of () => require(...)

defineLazyProperty(externals, 'Browserify', () => {
    return require('@revenge-mod/externals/browserify')
})

defineLazyProperty(externals, 'ReactNativeClipboard', () => {
    return require('@revenge-mod/externals/react-native-clipboard')
})

defineLazyProperty(externals, 'ReactNavigation', () => {
    return require('@revenge-mod/externals/react-navigation')
})

defineLazyProperty(externals, 'Shopify', () => {
    return require('@revenge-mod/externals/shopify')
})
