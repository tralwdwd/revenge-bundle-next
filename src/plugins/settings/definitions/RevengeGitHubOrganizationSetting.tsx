import { React, ReactNative } from '@revenge-mod/react'

import { GitHubOrganizationURL } from '~/constants'
import AssetIcon from '~/components/AssetIcon'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeGitHubOrganizationSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="img_account_sync_github_white" />,
    title: () => 'GitHub',
    onPress: () => ReactNative.Linking.openURL(GitHubOrganizationURL),
    type: 'pressable',
}

export default RevengeGitHubOrganizationSetting
