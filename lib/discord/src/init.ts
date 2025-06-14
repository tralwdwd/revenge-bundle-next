import { _emitter, _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import { Logger } from './common'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiDiscord } from './types/revenge'

const uapi = _uapi as UnscopedInitPluginApi
const discord = (uapi.discord = {} as PluginApiDiscord)

// ROLLDOWN ISSUE: Requires us to do () => { return require(...) } instead of () => require(...)

defineLazyProperty(discord, 'actions', () => {
    return require('@revenge-mod/discord/actions')
})

defineLazyProperty(discord, 'common', () => {
    return require('@revenge-mod/discord/common')
})

defineLazyProperty(discord, 'design', () => {
    return require('@revenge-mod/discord/design')
})

defineLazyProperty(discord, 'native', () => {
    return require('@revenge-mod/discord/native')
})

defineLazyProperty(discord, 'modules', () => {
    const modules = {} as PluginApiDiscord.Modules

    defineLazyProperty(modules, 'mainTabsV2', () => {
        return require('@revenge-mod/discord/modules/main_tabs_v2')
    })

    defineLazyProperty(modules, 'settings', () => {
        return {
            ...require('@revenge-mod/discord/modules/settings'),
            renderer: require('@revenge-mod/discord/modules/settings/renderer'),
        }
    })

    return modules
})

_emitter.on('init', ({ manifest: { id } }, api) =>
    defineLazyProperty(
        api,
        'logger',
        () => new Logger(`Revenge > Plugins (${id})`),
    ),
)
