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
    typeof import('@revenge-mod/modules/finders/lookup') &
    typeof import('@revenge-mod/modules/finders/wait') &
    typeof import('@revenge-mod/modules/finders/find') & {
        filters: typeof import('@revenge-mod/modules/finders/filters')
    }

export const modules: PluginApiModules = {
    get finders() {
        const api = {
            ...require('@revenge-mod/modules/finders/lookup'),
            ...require('@revenge-mod/modules/finders/wait'),
            ...require('@revenge-mod/modules/finders/find'),
            filters: require('@revenge-mod/modules/finders/filters'),
        }

        return (this.finders = api)
    },
    get metro() {
        const api: PluginApiModulesMetro = {
            ...require('@revenge-mod/modules/metro/utils'),
            ...require('@revenge-mod/modules/metro/subscriptions'),
        }

        return (this.metro = api)
    },
    get native() {
        return (this.native = require('@revenge-mod/modules/native'))
    },
}
