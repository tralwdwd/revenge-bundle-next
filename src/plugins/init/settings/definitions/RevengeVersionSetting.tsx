import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import RevengeIcon from '~assets/RevengeIcon'
import { MobileSetting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <TableRowAssetIcon id={RevengeIcon} />,
    title: () => 'Revenge',
    useDescription: () =>
        `${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${__BUILD_ENV__})`,
    type: 'static',
}

export default RevengeVersionSetting
