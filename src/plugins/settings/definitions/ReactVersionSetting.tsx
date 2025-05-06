import { React } from '@revenge-mod/react'

import { MobileSetting } from '../constants'

import AssetIcon from '~/components/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const ReactVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="ScienceIcon" />,
    title: () => 'React',
    useDescription: () => React.version,
    type: 'static',
}

export default ReactVersionSetting
