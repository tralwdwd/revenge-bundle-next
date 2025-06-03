import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { MobileSetting, UserSettingsSections } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const AssetBrowserSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="ImageIcon" />,
    title: () => 'Asset Browser',
    screen: {
        route: UserSettingsSections[MobileSetting.ASSET_BROWSER],
        getComponent: () =>
            require('../screens/AssetBrowserSettingScreen').default,
    },
}

export default AssetBrowserSetting
