/** biome-ignore-all lint/complexity/useArrowFunction: Rolldown issue: Bug requires us to use normal functions instead of arrow functions */

import { _initExts, _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import { Logger } from './common'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiDiscord } from './types/revenge'

const uapi = _uapi as UnscopedInitPluginApi
const discord = (uapi.discord = {} as PluginApiDiscord)

defineLazyProperty(discord, 'actions', function () {
    return require('@revenge-mod/discord/actions')
})

defineLazyProperty(discord, 'common', function () {
    return require('@revenge-mod/discord/common')
})

defineLazyProperty(discord, 'design', function () {
    return require('@revenge-mod/discord/design')
})

defineLazyProperty(discord, 'native', function () {
    return require('@revenge-mod/discord/native')
})

defineLazyProperty(discord, 'modules', function () {
    const modules = {} as PluginApiDiscord.Modules

    defineLazyProperty(modules, 'mainTabsV2', function () {
        return require('@revenge-mod/discord/modules/main_tabs_v2')
    })

    defineLazyProperty(modules, 'settings', function () {
        return {
            ...require('@revenge-mod/discord/modules/settings'),
            renderer: require('@revenge-mod/discord/modules/settings/renderer'),
        }
    })

    return modules
})

_initExts.push((api, { manifest: { id } }) =>
    defineLazyProperty(
        api,
        'logger',
        () => new Logger(`Revenge > Plugins (${id})`),
    ),
)
