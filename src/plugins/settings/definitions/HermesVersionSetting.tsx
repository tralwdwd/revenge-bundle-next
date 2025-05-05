import { React } from '@revenge-mod/react'

import AssetIcon from '~components/icons/AssetIcon'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

// @ts-expect-error
const props = HermesInternal.getRuntimeProperties()

const HermesVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="TranscriptOutlineIcon" />,
    title: () => 'Hermes',
    useDescription: () => `${props['Bytecode Version']} (${props.Build})`,
    type: 'static',
}

export default HermesVersionSetting
