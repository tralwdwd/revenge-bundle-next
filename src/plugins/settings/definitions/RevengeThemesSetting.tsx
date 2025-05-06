import AssetIcon from '~/components/AssetIcon'

import { MobileSetting, UserSettingsSections } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/settings'

const RevengeThemesSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon name="PaintPaletteIcon" />,
    title: () => 'Themes',
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_THEMES],
        getComponent: () => require('../screens/RevengeThemesSettingScreen').default,
    },
}

export default RevengeThemesSetting
