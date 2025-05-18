export interface PluginApiModules {
    finders: PluginApiModulesFinders
    metro: PluginApiModulesMetro
    native: PluginApiModulesNative
}

export type PluginApiModulesNative = typeof import('@revenge-mod/modules/native')

export type PluginApiModulesMetro =
    // biome-ignore format: Don't
    typeof import('@revenge-mod/modules/metro/utils') &
    typeof import('@revenge-mod/modules/metro/subscriptions')

export type PluginApiModulesFinders =
    // biome-ignore format: Don't
    typeof import('@revenge-mod/modules/finders/get') &
    typeof import('@revenge-mod/modules/finders/lookup') &
    typeof import('@revenge-mod/modules/finders/wait') & {
        filters: typeof import('@revenge-mod/modules/finders/filters')
    }

export const modules: PluginApiModules = {
    finders: {
        ...require('@revenge-mod/modules/finders/get'),
        ...require('@revenge-mod/modules/finders/lookup'),
        ...require('@revenge-mod/modules/finders/wait'),
        filters: require('@revenge-mod/modules/finders/filters'),
    },
    metro: {
        ...require('@revenge-mod/modules/metro/utils'),
        ...require('@revenge-mod/modules/metro/subscriptions'),
    },
    native: require('@revenge-mod/modules/native'),
}
