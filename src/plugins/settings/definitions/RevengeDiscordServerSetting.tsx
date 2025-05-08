import { React, ReactNative } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { DiscordServerURL } from '~/constants'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeDiscordServerSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="Discord" />,
    title: () => 'Discord Server',
    onPress: () => ReactNative.Linking.openURL(DiscordServerURL),
    type: 'pressable',
}

export default RevengeDiscordServerSetting
