import { getEnabledPluginsCount } from '@revenge-mod/plugins/_'

import AssetIcon from '~components/icons/AssetIcon'

import { MobileSetting, UserSettingsSections } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengePluginsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon name="PuzzlePieceIcon" />,
    title: () => 'Plugins',
    useTrailing: () => `${getEnabledPluginsCount()} enabled`,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_PLUGINS],
        getComponent: () => require('../screens/RevengePluginsSettingScreen').default,
    },
}

export default RevengePluginsSetting
