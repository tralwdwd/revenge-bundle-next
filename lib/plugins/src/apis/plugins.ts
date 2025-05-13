export interface PluginApiPlugins {
    constants: typeof import('@revenge-mod/plugins/constants')
}

export const plugins: PluginApiPlugins = {
    constants: require('@revenge-mod/plugins/constants'),
}
