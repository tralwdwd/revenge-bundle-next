import { React } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

// @ts-expect-error
const props = HermesInternal.getRuntimeProperties()

const HermesVersionSetting: SettingsRowConfig = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="TranscriptOutlineIcon" />,
    title: () => 'Hermes',
    useDescription: () => `${props['Bytecode Version']} (${props.Build})`,
    type: 'pressable',
}

export default HermesVersionSetting
