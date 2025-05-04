import { AlwaysHidden, MobileSetting, UserSettingsSections } from '../SettingsConstants'
import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeFontsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon name="TextIcon" />,
    title: () => 'Fonts',
    usePredicate: AlwaysHidden,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_PLUGINS],
        getComponent: () => require('../screens/RevengePluginsSettingScreen').default,
    },
}

export default RevengeFontsSetting
