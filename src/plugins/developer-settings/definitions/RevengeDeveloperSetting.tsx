import AssetIcon from '~/components/AssetIcon'

import { MobileSetting, UserSettingsSections } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/settings'

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
