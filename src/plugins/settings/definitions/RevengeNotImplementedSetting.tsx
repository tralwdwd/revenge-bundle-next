import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeNotImplementedSetting: SettingsItem = {
    parent: null,
    IconComponent: () => <AssetIcon name="CircleXIcon-primary" variant="danger" />,
    title: () => 'Not Implemented',
    useDescription: () => 'This feature is not implemented yet. Check back later!',
    variant: 'danger',
    type: 'pressable',
    unsearchable: true,
    useIsDisabled: () => true,
}

export default RevengeNotImplementedSetting
