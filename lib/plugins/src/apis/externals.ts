/** biome-ignore-all lint/complexity/useArrowFunction: Rolldown issue: Bug requires us to use normal functions instead of arrow functions */

import { defineLazyProperty } from '@revenge-mod/utils/objects'

export interface PluginApiExternals {
    Browserify: typeof import('@revenge-mod/externals/browserify')
    ReactNativeClipboard: typeof import('@revenge-mod/externals/react-native-clipboard')
    ReactNavigation: typeof import('@revenge-mod/externals/react-navigation')
    Shopify: typeof import('@revenge-mod/externals/shopify')
}

export const externals = {} as PluginApiExternals

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
