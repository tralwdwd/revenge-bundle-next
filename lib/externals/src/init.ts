/** biome-ignore-all lint/complexity/useArrowFunction: Rolldown issue: Bug requires us to use normal functions instead of arrow functions */

import { _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiExternals } from './types'

const uapi = _uapi as UnscopedInitPluginApi
const externals = (uapi.externals = {} as PluginApiExternals)

defineLazyProperty(externals, 'Browserify', function () {
    return require('@revenge-mod/externals/browserify')
})

defineLazyProperty(externals, 'ReactNativeClipboard', function () {
    return require('@revenge-mod/externals/react-native-clipboard')
})

defineLazyProperty(externals, 'ReactNavigation', function () {
    return require('@revenge-mod/externals/react-navigation')
})

defineLazyProperty(externals, 'Shopify', function () {
    return require('@revenge-mod/externals/shopify')
})
