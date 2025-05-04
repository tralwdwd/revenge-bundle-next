import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'

import { MobileSetting } from '../SettingsConstants'

export default function RevengeSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            sections={[
                {
                    settings: [MobileSetting.REVENGE_NOT_IMPLEMENTED],
                },
            ]}
        />
    )
}
