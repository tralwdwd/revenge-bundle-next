import { Design } from '@revenge-mod/discord/design'
import type { DiscordModules } from '@revenge-mod/discord/types'
import { ReactNative } from '@revenge-mod/react'

export default function Page(props: DiscordModules.Components.StackProps) {
    return (
        <Design.Stack style={styles.page} spacing={24} {...props}>
            {props.children}
        </Design.Stack>
    )
}

const styles = ReactNative.StyleSheet.create({
    page: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
})
