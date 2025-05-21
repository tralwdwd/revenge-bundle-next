import { React } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeNotImplementedSetting: SettingsItem = {
    parent: null,
    IconComponent: () => <TableRowAssetIcon name="CircleXIcon-primary" variant="danger" />,
    title: () => 'Not Implemented',
    useDescription: () => 'This feature is not implemented yet. Check back later!',
    variant: 'danger',
    type: 'pressable',
    unsearchable: true,
    useIsDisabled: () => true,
}

export default RevengeNotImplementedSetting
