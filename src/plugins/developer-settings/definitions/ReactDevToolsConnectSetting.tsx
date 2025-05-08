import { React } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { MobileSetting } from '../constants'
import { DevToolsContext, connectToDevTools, useIsDevToolsOpen } from '../devtools'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReactDevToolsConnectSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <TableRowAssetIcon name="LinkIcon" />,
    title: () => 'Connect to React DevTools',
    usePredicate: () => {
        const dtOpen = useIsDevToolsOpen()
        return DevToolsContext.available && !dtOpen
    },
    onPress: connectToDevTools,
    type: 'pressable',
}

export default ReactDevToolsConnectSetting
