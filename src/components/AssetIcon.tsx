import { getAssetByName, getAssetId } from '@revenge-mod/assets'
import { Components } from '@revenge-mod/discord/ui'

import type { DiscordModules } from '@revenge-mod/discord/types'

export default function AssetIcon(props: AssetIconProps) {
    return (
        <Components.TableRow.Icon
            source={props.name ? getAssetId(getAssetByName(props.name)!)! : props.id!}
            {...props}
        />
    )
}

export type AssetIconProps = Omit<DiscordModules.Components.TableRowIconProps, 'source'> &
    (
        | {
              name: string
              id?: never
          }
        | {
              name?: never
              id: number
          }
    )
