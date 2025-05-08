import { React } from '@revenge-mod/react'

import { MobileSetting } from '../constants'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReactVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
    title: () => 'React',
    useDescription: () => React.version,
    type: 'static',
}

export default ReactVersionSetting
