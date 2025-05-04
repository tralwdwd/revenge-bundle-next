import RevengeIcon from '../components/icons/RevengeIcon'
import { MobileSetting, UserSettingsSections } from '../SettingsConstants'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const RevengeSetting: SettingsRowConfig = {
    parent: null,
    type: 'route',
    IconComponent: RevengeIcon,
    title: () => 'Revenge',
    useTrailing: () => `${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__}`,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE],
        getComponent: () => require('../screens/RevengeSettingScreen').default,
    },
}

export default RevengeSetting
