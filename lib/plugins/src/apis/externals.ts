export interface PluginApiExternals {
    Browserify: typeof import('@revenge-mod/externals/browserify')
    ReactNavigation: typeof import('@revenge-mod/externals/react-navigation')
    Shopify: typeof import('@revenge-mod/externals/shopify')
}

export const externals: PluginApiExternals = {
    get Browserify() {
        return (this.Browserify = require('@revenge-mod/externals/browserify'))
    },
    get ReactNavigation() {
        return (this.ReactNavigation = require('@revenge-mod/externals/react-navigation'))
    },
    get Shopify() {
        return (this.Shopify = require('@revenge-mod/externals/shopify'))
    },
}
