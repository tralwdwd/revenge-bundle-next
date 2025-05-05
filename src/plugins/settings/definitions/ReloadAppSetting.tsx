import { BundleUpdaterManager } from '@revenge-mod/discord/native'
import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const ReloadAppSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="RetryIcon" />,
    title: () => 'Reload App',
    onPress: () => BundleUpdaterManager.reload(),
    type: 'pressable',
}

export default ReloadAppSetting
