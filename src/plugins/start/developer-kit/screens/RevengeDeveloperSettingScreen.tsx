import { styles } from '@revenge-mod/components/_'
import { ToastActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { SettingListRenderer } from '@revenge-mod/discord/modules/settings/renderer'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'
import { View } from 'react-native'
import { api } from '..'
import { Setting } from '../constants'
import { DTContext, useIsConnected as useIsDTConnected } from '../devtools'
import {
    RDTContext,
    useIsConnected as useIsRDTConnected,
} from '../react-devtools'

const CircleCheckIcon = lookupGeneratedIconComponent(
    'CircleCheckIcon',
    'CircleCheckIcon-secondary',
    'CircleCheckIcon-primary',
)

// TODO(plugins/settings): debug bridge
export default function RevengeDeveloperSettingScreen() {
    return (
        <Design.Stack spacing={0} style={styles.flex}>
            <DTAddrSetting />
            {globalThis.__REACT_DEVTOOLS__ && <RDTAddrSetting />}
            <SettingListRenderer.SettingsList
                sections={[
                    {
                        settings: [
                            Setting.DTAutoConnect,
                            Setting.DTConnect,
                            Setting.DTDisconnect,
                        ],
                    },
                    {
                        settings: [
                            Setting.RDTAutoConnect,
                            Setting.RDTConnect,
                            Setting.RDTDisconnect,
                        ],
                    },
                    {
                        label: 'Tools',
                        settings: [
                            Setting.EvalJS,
                            Setting.AssetBrowser,
                            Setting.TestErrorBoundary,
                        ],
                    },
                ]}
            />
        </Design.Stack>
    )
}

export function DTAddrSetting() {
    const open = useIsDTConnected()
    const settings = api.storage.use(s => s.devTools?.address)

    return (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Design.TextInput
                defaultValue={settings?.devTools.address ?? DTContext.addr}
                editable={!open}
                isDisabled={open}
                label="DevTools"
                leadingText="ws://"
                onBlur={() =>
                    api.storage
                        .set({
                            devTools: {
                                address: DTContext.addr,
                            },
                        })
                        .then(() =>
                            ToastActionCreators.open({
                                IconComponent: CircleCheckIcon,
                                key: 'DEVTOOLS_ADDRESS_SAVED',
                                content: 'Address saved',
                            }),
                        )
                }
                onChange={text => {
                    DTContext.addr = text
                }}
                returnKeyType="done"
            />
        </View>
    )
}

export function RDTAddrSetting() {
    const open = useIsRDTConnected()
    const settings = api.storage.use(s => s.reactDevTools?.address)

    return (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Design.TextInput
                defaultValue={
                    settings?.reactDevTools.address ?? RDTContext.addr
                }
                editable={!open}
                isDisabled={open}
                label="React DevTools"
                leadingText="ws://"
                onBlur={() =>
                    api.storage
                        .set({
                            reactDevTools: {
                                address: RDTContext.addr,
                            },
                        })
                        .then(() =>
                            ToastActionCreators.open({
                                IconComponent: CircleCheckIcon,
                                key: 'REACT_DEVTOOLS_ADDRESS_SAVED',
                                content: 'Address saved',
                            }),
                        )
                }
                onChange={text => {
                    RDTContext.addr = text
                }}
                returnKeyType="done"
            />
        </View>
    )
}
