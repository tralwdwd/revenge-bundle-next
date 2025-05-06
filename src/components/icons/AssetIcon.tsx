import { getAssetByName, getAssetId } from '@revenge-mod/assets'
import { Components } from '@revenge-mod/discord/ui'

import type { DiscordModules } from '@revenge-mod/discord/types'

export default function AssetIcon(props: AssetIconProps) {
    return <Components.TableRow.Icon source={getAssetId(getAssetByName(props.name)!)!} {...props} />
}

export interface AssetIconProps extends Omit<DiscordModules.Components.TableRowIconProps, 'source'> {
    name: string
}
