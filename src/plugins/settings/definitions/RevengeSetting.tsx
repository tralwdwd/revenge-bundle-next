import AssetIcon from '~/components/AssetIcon'
import RevengeIcon from '~assets/RevengeIcon'

import { MobileSetting, UserSettingsSections } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon id={RevengeIcon} />,
    title: () => 'Revenge',
    useTrailing: () => `${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__}`,
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE],
        getComponent: () => require('../screens/RevengeSettingScreen').default,
    },
}

export default RevengeSetting
