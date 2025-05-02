import { React } from '@revenge-mod/react'
import { addSettingsSection } from '@revenge-mod/discord/ui/settings'

import RevengeIcon from '../components/icons/RevengeIcon'

export const REVENGE = 'REVENGE'
const ROUTE = 'Revenge'

addSettingsSection(REVENGE, {
    label: 'Revenge',
    settings: {
        [REVENGE]: {
            parent: null,
            type: 'route',
            IconComponent: RevengeIcon,
            title: () => ROUTE,
            useTrailing: () => `${__BUILD_VERSION__} (${__BUILD_COMMIT__}-${__BUILD_BRANCH__})`,
            screen: {
                route: ROUTE,
                getComponent: () => React.lazy(() => import('../screens/RevengeSettingScreen')),
            },
        },
    },
})
