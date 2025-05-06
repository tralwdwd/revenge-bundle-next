import { React, ReactNative } from '@revenge-mod/react'

import AssetIcon from '~/components/AssetIcon'
import { DiscordServerURL } from '~/constants'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/settings'

const RevengeDiscordServerSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="Discord" />,
    title: () => 'Discord Server',
    onPress: () => ReactNative.Linking.openURL(DiscordServerURL),
    type: 'pressable',
}

export default RevengeDiscordServerSetting
