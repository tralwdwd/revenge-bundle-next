import { _emitter, _uapi } from '@revenge-mod/plugins/_'
import {
    defineLazyProperties,
    defineLazyProperty,
} from '@revenge-mod/utils/objects'
import { Logger } from './common'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'
import type { PluginApiDiscord } from './types/revenge'

defineLazyProperties(
    ((_uapi as UnscopedInitPluginApi).discord = {} as PluginApiDiscord),
    {
        actions: () => require('@revenge-mod/discord/actions'),
        common: () => require('@revenge-mod/discord/common'),
        design: () => require('@revenge-mod/discord/design'),
        native: () => require('@revenge-mod/discord/native'),
        modules: () =>
            defineLazyProperties({} as PluginApiDiscord.Modules, {
                mainTabsV2: () =>
                    require('@revenge-mod/discord/modules/main_tabs_v2'),
                settings: () => ({
                    ...require('@revenge-mod/discord/modules/settings'),
                    renderer: require('@revenge-mod/discord/modules/settings/renderer'),
                }),
            }),
    },
)

_emitter.on('init', ({ manifest: { id } }, api) =>
    defineLazyProperty(
        api,
        'logger',
        () => new Logger(`Revenge > Plugins (${id})`),
    ),
)
