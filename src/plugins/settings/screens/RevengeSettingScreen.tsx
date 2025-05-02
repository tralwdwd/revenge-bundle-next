import { SettingListRenderer } from '@revenge-mod/discord/ui/settings'

import { REVENGE_VERSION } from '../definitions/RevengeVersion'
import { REACT_VERSION } from '../definitions/ReactVersion'
import { REACT_NATIVE_VERSION } from '../definitions/ReactNativeVersion'
import { HERMES_VERSION } from '../definitions/HermesVersion'

export default function RevengeSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            sections={[
                {
                    settings: [REVENGE_VERSION, REACT_VERSION, REACT_NATIVE_VERSION, HERMES_VERSION],
                    subLabel: [
                        'You are using the next version of Revenge! This version is experimental and may be unstable.',
                    ],
                },
            ]}
        />
    )
}
