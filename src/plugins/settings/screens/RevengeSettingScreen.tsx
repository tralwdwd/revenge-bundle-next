import { SettingListRenderer } from '@revenge-mod/discord/modules/settings'
import components from '@revenge-mod/discord/design/components'
import { MobileSetting } from '../constants'

export default function RevengeSettingScreen() {
    return (
        <SettingListRenderer.SettingsList
            sections={[
                {
                    label: 'Revenge',
                    settings: [
                        MobileSetting.REVENGE_VERSION,
                        MobileSetting.REVENGE_DISCORD_SERVER,
                        MobileSetting.REVENGE_GITHUB_ORGANIZATION,
                    ],
                    subLabel: (
                        <>
                            <components.Text variant="text-xs/medium">
                                You are using the next version of Revenge!
                            </components.Text>
                            <components.Text variant="text-xs/semibold" color="text-danger">
                                This version is experimental and may be unstable.
                            </components.Text>
                        </>
                    ),
                },
                {
                    label: 'Versions',
                    settings: [
                        MobileSetting.REACT_VERSION,
                        MobileSetting.REACT_NATIVE_VERSION,
                        MobileSetting.HERMES_VERSION,
                    ],
                },
                {
                    label: 'Actions',
                    settings: [MobileSetting.RELOAD_APP],
                },
            ]}
        />
    )
}
