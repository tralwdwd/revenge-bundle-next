import { BundleUpdaterManager } from '@revenge-mod/discord/native'
import { React } from '@revenge-mod/react'

import AssetIcon from '~/components/AssetIcon'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/settings'

const ReloadAppSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="RetryIcon" />,
    title: () => 'Reload App',
    onPress: () => BundleUpdaterManager.reload(),
    type: 'pressable',
}

export default ReloadAppSetting
