import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'

import { MobileSetting } from '../SettingsConstants'

export default function RevengeDeveloperSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            sections={[
                {
                    label: 'React DevTools',
                    settings: [MobileSetting.REVENGE_NOT_IMPLEMENTED],
                },
                {
                    label: 'Tools',
                    settings: [MobileSetting.EVALUATE_JAVASCRIPT, MobileSetting.CALL_GARBAGE_COLLECTOR],
                },
            ]}
        />
    )
}
