import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { version } from 'react'
import { MobileSetting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReactVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
    title: () => 'React',
    useDescription: () => version,
    type: 'static',
}

export default ReactVersionSetting
