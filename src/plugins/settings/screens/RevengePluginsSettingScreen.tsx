import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'

import { MobileSetting } from '../SettingsConstants'

export default function RevengePluginsSettingScreen() {
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
