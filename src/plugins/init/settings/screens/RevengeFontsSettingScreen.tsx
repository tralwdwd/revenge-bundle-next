import { SettingListRenderer } from '@revenge-mod/discord/modules/settings/renderer'
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
