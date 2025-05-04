import RevengeIcon from '../components/icons/RevengeIcon'
import { MobileSetting } from '../SettingsConstants'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const RevengeVersionSetting: SettingsItem = {
    parent: MobileSetting.REVENGE,
    IconComponent: RevengeIcon,
    title: () => 'Revenge',
    useDescription: () => `${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${__BUILD_ENV__})`,
    type: 'pressable',
}

export default RevengeVersionSetting
