import { getEnabledPluginsCount } from '@revenge-mod/plugins/_'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { MobileSetting, UserSettingsSections } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengePluginsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="PuzzlePieceIcon" />,
    title: () => 'Plugins',
    useTrailing: () => `${getEnabledPluginsCount()} enabled`,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_PLUGINS],
        getComponent: () => require('../screens/RevengePluginsSettingScreen').default,
    },
}

export default RevengePluginsSetting
