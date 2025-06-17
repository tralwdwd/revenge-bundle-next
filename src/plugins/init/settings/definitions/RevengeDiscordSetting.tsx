import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { Linking } from 'react-native'
import { DiscordServerURL } from '~/constants'
import { Setting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeDiscordSetting: SettingsItem = {
    parent: Setting.Revenge,
    IconComponent: () => <TableRowAssetIcon name="Discord" />,
    title: () => 'Discord Server',
    onPress: () => {
        Linking.openURL(DiscordServerURL)
    },
    type: 'pressable',
}

export default RevengeDiscordSetting
