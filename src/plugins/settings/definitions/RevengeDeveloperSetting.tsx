import { MobileSetting, UserSettingsSections } from '../SettingsConstants'
import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeDeveloperSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <AssetIcon name="WrenchIcon" />,
    title: () => 'Developer',
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_DEVELOPER],
        getComponent: () => require('../screens/RevengeDeveloperSettingScreen').default,
    },
}

export default RevengeDeveloperSetting
