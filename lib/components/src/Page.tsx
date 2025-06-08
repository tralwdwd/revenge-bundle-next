import { Design } from '@revenge-mod/discord/design'
import { StyleSheet } from 'react-native'
import type { DiscordModules } from '@revenge-mod/discord/types'

export default function Page(props: DiscordModules.Components.StackProps) {
    return (
        <Design.Stack spacing={24} style={styles.page} {...props}>
            {props.children}
        </Design.Stack>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
})
