import * as PluginsApiConstants from '@revenge-mod/plugins/constants'

export interface PluginApiPlugins {
    constants: typeof import('@revenge-mod/plugins/constants')
}

export const plugins: PluginApiPlugins = {
    constants: PluginsApiConstants,
}
