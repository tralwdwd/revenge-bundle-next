import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { MobileSetting, UserSettingsSections } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeDeveloperSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="WrenchIcon" />,
    title: () => 'Developer',
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_DEVELOPER],
        getComponent: () =>
            require('../screens/RevengeDeveloperSettingScreen').default,
    },
}

export default RevengeDeveloperSetting
