import { FormSwitch as Switch } from '@revenge-mod/discord/design'
import { ReactNative } from '@revenge-mod/react'
import type { DiscordModules } from '@revenge-mod/discord/types'

/**
 * A switch component that is styled to match Discord's configuration
 */
export default function FormSwitch(
    props: DiscordModules.Components.FormSwitchProps,
) {
    return (
        <ReactNative.View style={props.disabled && styles.disabled}>
            <Switch {...props} />
        </ReactNative.View>
    )
}

const styles = ReactNative.StyleSheet.create({
    disabled: {
        opacity: 0.5,
    },
})
