import { getAssetByName } from '@revenge-mod/assets'
import type { DiscordModules } from '@revenge-mod/discord/types'
import { Components } from '@revenge-mod/discord/ui'

export default function AssetIcon(props: AssetIconProps) {
    return <Components.TableRow.Icon source={getAssetByName(props.name)?.id!} {...props} />
}

export interface AssetIconProps extends Omit<DiscordModules.Components.TableRowIconProps, 'source'> {
    name: string
}
