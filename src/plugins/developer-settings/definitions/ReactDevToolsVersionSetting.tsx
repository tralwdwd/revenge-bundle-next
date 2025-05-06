import { React } from '@revenge-mod/react'

import AssetIcon from '~/components/AssetIcon'

import { MobileSetting } from '../constants'
import { DevToolsContext } from '../devtools'

import type { SettingsItem } from '@revenge-mod/discord/settings'

const ReactDevToolsVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <AssetIcon name="ScienceIcon" />,
    title: () => 'React DevTools',
    useDescription: () => __REACT_DEVTOOLS__!.version,
    usePredicate: () => DevToolsContext.available,
    type: 'static',
}

export default ReactDevToolsVersionSetting
