export interface PluginApiDiscord {
    actions: PluginApiDiscordActions
    common: PluginApiDiscordCommon
    design: PluginApiDiscordDesign
    modules: PluginApiDiscordModules
    native: PluginApiDiscordNative
}

export type PluginApiDiscordActions = typeof import('@revenge-mod/discord/actions')
export type PluginApiDiscordCommon = typeof import('@revenge-mod/discord/common')
export type PluginApiDiscordDesign = typeof import('@revenge-mod/discord/design')
export type PluginApiDiscordNative = typeof import('@revenge-mod/discord/native')

export interface PluginApiDiscordModules {
    settings: typeof import('@revenge-mod/discord/modules/settings') & {
        renderer: typeof import('@revenge-mod/discord/modules/settings/renderer')
    }
}

export const discord: PluginApiDiscord = {
    get actions() {
        return (this.actions = require('@revenge-mod/discord/actions'))
    },
    get common() {
        return (this.common = require('@revenge-mod/discord/common'))
    },
    get design() {
        return (this.design = require('@revenge-mod/discord/design'))
    },
    native: require('@revenge-mod/discord/native'),
    modules: {
        get settings() {
            const api = {
                ...require('@revenge-mod/discord/modules/settings'),
                renderer: require('@revenge-mod/discord/modules/settings/renderer'),
            }

            return (this.settings = api)
        },
    },
}
