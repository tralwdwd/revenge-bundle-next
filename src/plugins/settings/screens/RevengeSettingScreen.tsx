import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'
import { MobileSetting } from '../SettingsConstants'

export default function RevengeSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            sections={[
                {
                    settings: [
                        MobileSetting.REVENGE_VERSION,
                        MobileSetting.REACT_VERSION,
                        MobileSetting.REACT_NATIVE_VERSION,
                        MobileSetting.HERMES_VERSION,
                    ],
                    subLabel: [
                        'You are using the next version of Revenge! This version is experimental and may be unstable.',
                    ],
                },
            ]}
        />
    )
}
