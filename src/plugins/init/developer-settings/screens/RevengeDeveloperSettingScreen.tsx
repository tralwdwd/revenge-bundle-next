import { ToastActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { SettingListRenderer } from '@revenge-mod/discord/modules/settings/renderer'
import { React, ReactNative } from '@revenge-mod/react'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'

import { api } from '..'
import { MobileSetting } from '../constants'
import { DevToolsContext, useIsDevToolsOpen } from '../react-devtools'

const CircleCheckIcon = lookupGeneratedIconComponent(
    'CircleCheckIcon',
    'CircleCheckIcon-secondary',
    'CircleCheckIcon-primary',
)

// TODO(plugins/settings): debug bridge
export default function RevengeDeveloperSettingScreen() {
    return (
        <Design.Stack spacing={0} style={{ flexGrow: 1 }}>
            {globalThis.__REACT_DEVTOOLS__ && <ReactDevToolsAddressSetting />}
            <SettingListRenderer.SettingsList
                sections={[
                    {
                        settings: [],
                    },
                    {
                        settings: [
                            MobileSetting.REACT_DEVTOOLS_VERSION,
                            MobileSetting.REACT_DEVTOOLS_AUTO_CONNECT,
                            MobileSetting.REACT_DEVTOOLS_CONNECT,
                            MobileSetting.REACT_DEVTOOLS_DISCONNECT,
                        ],
                    },
                    {
                        label: 'Tools',
                        settings: [MobileSetting.EVALUATE_JAVASCRIPT, MobileSetting.ASSET_BROWSER],
                    },
                ]}
            />
        </Design.Stack>
    )
}

export function ReactDevToolsAddressSetting() {
    const open = useIsDevToolsOpen()
    const settings = api.storage.use(s => s.devtools?.address)

    return (
        <ReactNative.View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Design.TextInput
                editable={!open}
                isDisabled={open}
                leadingText="ws://"
                defaultValue={settings?.devtools.address ?? DevToolsContext.address}
                label="React DevTools"
                onChange={text => (DevToolsContext.address = text)}
                onBlur={() => {
                    api.storage
                        .set({
                            devtools: {
                                address: DevToolsContext.address,
                            },
                        })
                        .then(() => {
                            ToastActionCreators.open({
                                IconComponent: CircleCheckIcon,
                                key: 'REACT_DEVTOOLS_ADDRESS_SAVED',
                                content: 'Address saved',
                            })
                        })
                }}
                returnKeyType="done"
            />
        </ReactNative.View>
    )
}
