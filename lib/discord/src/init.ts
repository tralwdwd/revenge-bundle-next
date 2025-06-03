import { _initExts, _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import { Logger } from './common'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiDiscord } from './types/revenge'

const uapi = _uapi as UnscopedInitPluginApi
const discord = (uapi.discord = {} as PluginApiDiscord)

// TODO: Rolldown issue: Bug requires us to do { ...require('...') } instead of just require('...')
defineLazyProperty(discord, 'actions', () => ({
    ...require('@revenge-mod/discord/actions'),
}))
defineLazyProperty(discord, 'common', () => ({
    ...require('@revenge-mod/discord/common'),
}))
defineLazyProperty(discord, 'design', () => ({
    ...require('@revenge-mod/discord/design'),
}))
defineLazyProperty(discord, 'native', () => ({
    ...require('@revenge-mod/discord/native'),
}))
defineLazyProperty(discord, 'modules', () => ({
    settings: {
        ...require('@revenge-mod/discord/modules/settings'),
        renderer: require('@revenge-mod/discord/modules/settings/renderer'),
    },
}))

_initExts.push((api, { manifest: { id } }) =>
    defineLazyProperty(
        api,
        'logger',
        () => new Logger(`Revenge > Plugins (${id})`),
    ),
)
