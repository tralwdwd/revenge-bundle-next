import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { Platform } from 'react-native'
import { MobileSetting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const { major, minor, patch, prerelease } =
    Platform.constants.reactNativeVersion
const version = `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ''}`

const ReactNativeVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon name="ScienceIcon" />,
    title: () => 'React Native',
    useDescription: () => version,
    type: 'static',
}

export default ReactNativeVersionSetting
