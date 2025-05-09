import { Components } from '@revenge-mod/discord/design'
import { SettingListRenderer } from '@revenge-mod/discord/modules/settings/renderer'
import { React, ReactNative } from '@revenge-mod/react'

import { MobileSetting } from '../constants'
import { DevToolsContext } from '../devtools'

// TODO(plugins/settings): debug bridge
export default function RevengeDeveloperSettingScreen() {
    return (
        <Components.Stack spacing={0} style={{ flexGrow: 1 }}>
            {globalThis.__REACT_DEVTOOLS__ && <ReactDevToolsAddressSetting />}
            <SettingListRenderer.SettingsList
                sections={[
                    {
                        settings: [],
                    },
                    {
                        settings: [
                            MobileSetting.REACT_DEVTOOLS_VERSION,
                            MobileSetting.REACT_DEVTOOLS_CONNECT,
                            MobileSetting.REACT_DEVTOOLS_DISCONNECT,
                        ],
                    },
                    {
                        label: 'Tools',
                        settings: [MobileSetting.EVALUATE_JAVASCRIPT],
                    },
                ]}
            />
        </Components.Stack>
    )
}

export function ReactDevToolsAddressSetting() {
    return (
        <ReactNative.View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Components.TextInput
                editable={!DevToolsContext.open}
                isDisabled={DevToolsContext.open}
                leadingText="ws://"
                defaultValue={DevToolsContext.address}
                label="React DevTools"
                onChange={text => (DevToolsContext.address = text)}
                returnKeyType="done"
            />
        </ReactNative.View>
    )
}
