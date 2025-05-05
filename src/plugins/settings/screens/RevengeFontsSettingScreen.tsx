import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'

import { MobileSetting } from '../constants'

export default function RevengeFontsSettingScreen() {
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
