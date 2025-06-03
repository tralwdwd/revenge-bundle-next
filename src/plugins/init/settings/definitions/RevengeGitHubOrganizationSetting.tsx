import { ReactNative } from '@revenge-mod/react'
import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { GitHubOrganizationURL } from '~/constants'
import { MobileSetting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeGitHubOrganizationSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => (
        <TableRowAssetIcon name="img_account_sync_github_white" />
    ),
    title: () => 'GitHub',
    onPress: () => ReactNative.Linking.openURL(GitHubOrganizationURL),
    type: 'pressable',
}

export default RevengeGitHubOrganizationSetting
