import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'

import { MobileSetting } from '../SettingsConstants'

export default function RevengeDeveloperSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            sections={[
                {
                    settings: [MobileSetting.CALL_GARBAGE_COLLECTOR],
                },
                {
                    label: 'Tests',
                    settings: [MobileSetting.TRIGGER_ERROR_BOUNDARY],
                },
            ]}
        />
    )
}
