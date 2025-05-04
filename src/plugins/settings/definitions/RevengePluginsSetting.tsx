import { getEnabledPluginsCount } from '@revenge-mod/plugins/_'

import { AlwaysHidden, MobileSetting, UserSettingsSections } from '../SettingsConstants'
import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengePluginsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon name="PuzzlePieceIcon" />,
    title: () => 'Plugins',
    useTrailing: () => `${getEnabledPluginsCount()} enabled`,
    usePredicate: AlwaysHidden,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_PLUGINS],
        getComponent: () => require('../screens/RevengePluginsSettingScreen').default,
    },
}

export default RevengePluginsSetting
