import { Components } from '@revenge-mod/discord/design'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'

import type { DiscordModules } from '@revenge-mod/discord/types'

const MagnifyingGlassIcon = lookupGeneratedIconComponent('MagnifyingGlassIcon')

export default function SearchInput(props: DiscordModules.Components.TextInputProps) {
    return (
        <Components.TextInput
            leadingIcon={MagnifyingGlassIcon}
            size="md"
            placeholder="Search"
            returnKeyType="search"
            {...props}
        />
    )
}
