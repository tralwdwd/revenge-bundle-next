import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { MobileSetting, UserSettingsSections } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeFontsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="TextIcon" />,
    title: () => 'Fonts',
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_PLUGINS],
        getComponent: () =>
            require('../screens/RevengePluginsSettingScreen').default,
    },
}

export default RevengeFontsSetting
