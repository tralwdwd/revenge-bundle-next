import { getAssetByName } from '@revenge-mod/assets'

import { Components } from '@revenge-mod/discord/ui'
import { addSettingsRow } from '@revenge-mod/discord/ui/settings'

import { React, ReactNative } from '@revenge-mod/react'

import { REVENGE } from './Revenge'

export const REACT_NATIVE_VERSION = 'REACT_NATIVE_VERSION'

const { major, minor, patch, prerelease } = ReactNative.Platform.constants.reactNativeVersion
const version = `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ''}`

addSettingsRow(REACT_NATIVE_VERSION, {
    parent: REVENGE,
    IconComponent: () => <Components.TableRow.Icon source={getAssetByName('ScienceIcon')!.id} />,
    title: () => 'React Native',
    useDescription: () => version,
    type: 'pressable',
})
