import { React, ReactNative } from '@revenge-mod/react'

import AssetIcon from '../components/icons/AssetIcon'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const { major, minor, patch, prerelease } = ReactNative.Platform.constants.reactNativeVersion
const version = `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ''}`

const ReactNativeVersionSetting: SettingsRowConfig = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon name="ScienceIcon" />,
    title: () => 'React Native',
    useDescription: () => version,
    type: 'pressable',
}

export default ReactNativeVersionSetting
