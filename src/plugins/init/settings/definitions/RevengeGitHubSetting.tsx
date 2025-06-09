import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { Linking } from 'react-native'
import { GitHubOrganizationURL } from '~/constants'
import { Setting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeGitHubSetting: SettingsItem = {
    parent: Setting.Revenge,
    IconComponent: () => (
        <TableRowAssetIcon name="img_account_sync_github_white" />
    ),
    title: () => 'GitHub',
    onPress: () => Linking.openURL(GitHubOrganizationURL),
    type: 'pressable',
}

export default RevengeGitHubSetting
