import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { BuildEnvironment } from '~/constants'
import RevengeIcon from '~assets/RevengeIcon'
import { Setting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengeVersionSetting: SettingsItem = {
    parent: Setting.Revenge,
    IconComponent: () => <TableRowAssetIcon id={RevengeIcon} />,
    title: () => 'Revenge',
    useDescription: () =>
        `${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${BuildEnvironment})`,
    type: 'static',
}

export default RevengeVersionSetting
