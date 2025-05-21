import { React } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { MobileSetting } from '../constants'
import { disconnectFromDevTools, useIsDevToolsOpen } from '../react-devtools'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReactDevToolsDisconnectSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <TableRowAssetIcon name="DenyIcon" variant="danger" />,
    variant: 'danger',
    title: () => 'Disconnect from React DevTools',
    usePredicate: useIsDevToolsOpen,
    onPress: disconnectFromDevTools,
    type: 'pressable',
}

export default ReactDevToolsDisconnectSetting
