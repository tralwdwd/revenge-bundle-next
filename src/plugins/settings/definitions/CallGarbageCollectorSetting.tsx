import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const CallGarbageCollectorSetting: SettingsItem = {
    parent: null,
    IconComponent: () => <AssetIcon name="FireIcon" />,
    title: () => 'Call Garbage Collector',
    useDescription: () => 'Call the garbage collector manually.',
    onPress: gc,
    type: 'pressable',
}

export default CallGarbageCollectorSetting
