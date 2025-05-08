import { BundleUpdaterManager } from '@revenge-mod/discord/native'
import { React } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReloadAppSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="RetryIcon" />,
    title: () => 'Reload App',
    onPress: () => BundleUpdaterManager.reload(),
    type: 'pressable',
}

export default ReloadAppSetting
