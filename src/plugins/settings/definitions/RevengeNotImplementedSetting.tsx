import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const RevengeNotImplementedSetting: SettingsRowConfig = {
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
