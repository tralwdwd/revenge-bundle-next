import { addSettingsRow } from '@revenge-mod/discord/ui/settings'

import { REVENGE } from './Revenge'

import RevengeIcon from '../components/icons/RevengeIcon'

export const REVENGE_VERSION = 'REVENGE_VERSION'

addSettingsRow(REVENGE_VERSION, {
    parent: REVENGE,
    IconComponent: RevengeIcon,
    title: () => 'Revenge',
    useDescription: () => `${__BUILD_VERSION__} (${__BUILD_COMMIT__}-${__BUILD_BRANCH__} ${__BUILD_ENV__})`,
    type: 'pressable',
})
