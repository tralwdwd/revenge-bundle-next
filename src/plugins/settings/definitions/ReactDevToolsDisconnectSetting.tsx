import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { disconnectFromDevTools, useIsDevToolsOpen } from '../devtools'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const ReactDevToolsDisconnectSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <AssetIcon name="DenyIcon" variant="danger" />,
    variant: 'danger',
    title: () => 'Disconnect from React DevTools',
    usePredicate: useIsDevToolsOpen,
    onPress: disconnectFromDevTools,
    type: 'pressable',
}

export default ReactDevToolsDisconnectSetting
