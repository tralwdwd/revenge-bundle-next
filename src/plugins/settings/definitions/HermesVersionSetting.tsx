import { React } from '@revenge-mod/react'

import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

// @ts-expect-error
const props = HermesInternal.getRuntimeProperties()

const HermesVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="TranscriptOutlineIcon" />,
    title: () => 'Hermes',
    useDescription: () => `${props['Bytecode Version']} (${props.Build})`,
    type: 'static',
}

export default HermesVersionSetting
