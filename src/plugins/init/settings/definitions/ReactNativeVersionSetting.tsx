import { ReactNative } from '@revenge-mod/react'
import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { MobileSetting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const { major, minor, patch, prerelease } =
    ReactNative.Platform.constants.reactNativeVersion
const version = `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ''}`

const ReactNativeVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
    title: () => 'React Native',
    useDescription: () => version,
    type: 'static',
}

export default ReactNativeVersionSetting
