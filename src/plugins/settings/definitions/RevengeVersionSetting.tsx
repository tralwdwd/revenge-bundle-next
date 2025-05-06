import AssetIcon from '~/components/AssetIcon'
import RevengeIcon from '~assets/RevengeIcon'

import { MobileSetting } from '../constants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <AssetIcon id={RevengeIcon} />,
    title: () => 'Revenge',
    useDescription: () => `${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${__BUILD_ENV__})`,
    type: 'static',
}

export default RevengeVersionSetting
