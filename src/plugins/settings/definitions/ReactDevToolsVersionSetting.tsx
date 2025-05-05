import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'
import { DevToolsContext } from '../devtools'

const ReactDevToolsVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <AssetIcon name="ScienceIcon" />,
    title: () => 'React DevTools',
    useDescription: () => __REACT_DEVTOOLS__!.version,
    usePredicate: () => DevToolsContext.available,
    type: 'static',
}

export default ReactDevToolsVersionSetting
