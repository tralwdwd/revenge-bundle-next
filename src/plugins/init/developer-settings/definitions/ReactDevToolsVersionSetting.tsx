import { React } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { MobileSetting } from '../constants'
import { DevToolsContext } from '../react-devtools'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReactDevToolsVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
    title: () => 'React DevTools',
    useDescription: () => __REACT_DEVTOOLS__!.version,
    usePredicate: () => DevToolsContext.available,
    type: 'static',
}

export default ReactDevToolsVersionSetting
