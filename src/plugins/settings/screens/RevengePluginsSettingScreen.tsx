import { SettingListRenderer } from '@revenge-mod/discord/settings'

import { MobileSetting } from '../constants'

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
