import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { MobileSetting, UserSettingsSections } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeThemesSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="PaintPaletteIcon" />,
    title: () => 'Themes',
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_THEMES],
        getComponent: () =>
            require('../screens/RevengeThemesSettingScreen').default,
    },
}

export default RevengeThemesSetting
