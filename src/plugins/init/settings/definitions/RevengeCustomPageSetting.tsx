import { MobileSetting, UserSettingsSections } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeCustomPageSetting: SettingsItem = {
    parent: null,
    title: () => 'Revenge Custom Page',
    type: 'route',
    unsearchable: true,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_CUSTOM_PAGE],
        getComponent: () =>
            require('../screens/RevengeCustomPageScreen').default,
    },
}

export default RevengeCustomPageSetting
