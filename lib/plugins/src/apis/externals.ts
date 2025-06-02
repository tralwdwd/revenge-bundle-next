import { defineLazyProperty } from '@revenge-mod/utils/objects'

export interface PluginApiExternals {
    Browserify: typeof import('@revenge-mod/externals/browserify')
    ReactNativeClipboard: typeof import('@revenge-mod/externals/react-native-clipboard')
    ReactNavigation: typeof import('@revenge-mod/externals/react-navigation')
    Shopify: typeof import('@revenge-mod/externals/shopify')
}

export const externals = {} as PluginApiExternals

// TODO: Rolldown issue: Bug requires us to do { ...require('...') } instead of just require('...')
defineLazyProperty(externals, 'Browserify', () => ({ ...require('@revenge-mod/externals/browserify') }))
defineLazyProperty(externals, 'ReactNativeClipboard', () => ({
    ...require('@revenge-mod/externals/react-native-clipboard'),
}))
defineLazyProperty(externals, 'ReactNavigation', () => ({ ...require('@revenge-mod/externals/react-navigation') }))
defineLazyProperty(externals, 'Shopify', () => ({ ...require('@revenge-mod/externals/shopify') }))
