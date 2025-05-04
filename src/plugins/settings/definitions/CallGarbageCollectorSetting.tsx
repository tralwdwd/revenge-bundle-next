import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const CallGarbageCollectorSetting: SettingsRowConfig = {
    parent: null,
    IconComponent: () => <AssetIcon name="FireIcon" />,
    title: () => 'Call Garbage Collector',
    useDescription: () => 'Call the garbage collector manually.',
    onPress: gc,
    type: 'pressable',
}

export default CallGarbageCollectorSetting
