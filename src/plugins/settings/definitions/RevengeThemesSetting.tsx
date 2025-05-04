import { AlwaysHidden, MobileSetting, UserSettingsSections } from '../SettingsConstants'
import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const RevengeThemesSetting: SettingsRowConfig = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon name="PaintPaletteIcon" />,
    title: () => 'Themes',
    usePredicate: AlwaysHidden,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_THEMES],
        getComponent: () => require('../screens/RevengeThemesSettingScreen').default,
    },
}

export default RevengeThemesSetting
