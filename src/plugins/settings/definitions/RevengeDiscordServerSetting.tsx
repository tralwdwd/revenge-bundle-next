import { React, ReactNative } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'
import { DiscordServerURL } from '../../../constants'

const RevengeDiscordServerSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="Discord" />,
    title: () => 'Discord Server',
    onPress: () => ReactNative.Linking.openURL(DiscordServerURL),
    type: 'pressable',
}

export default RevengeDiscordServerSetting
