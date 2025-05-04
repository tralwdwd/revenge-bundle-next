import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { MobileSetting, UserSettingsSections } from '../SettingsConstants'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const TriggerErrorBoundarySetting: SettingsRowConfig = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <AssetIcon name="ScreenXIcon" variant="danger" />,
    title: () => 'Trigger Error Boundary',
    variant: 'danger',
    useDescription: () => 'This will crash the app.',
    type: 'route',
    screen: {
        route: UserSettingsSections[MobileSetting.TRIGGER_ERROR_BOUNDARY],
        getComponent: () => require('../screens/TriggerErrorBoundarySettingScreen').default,
    },
}

export default TriggerErrorBoundarySetting
