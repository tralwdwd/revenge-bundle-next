import { getAssetByName } from '@revenge-mod/assets'
import { Components } from '@revenge-mod/discord/ui'
import { React } from '@revenge-mod/react'

import { MobileSetting } from '../SettingsConstants'

import type { SettingsRowConfig } from '@revenge-mod/discord/ui/settings'

const ReactVersionSetting: SettingsRowConfig = {
    parent: MobileSetting.REVENGE,
    IconComponent: () => <Components.TableRow.Icon source={getAssetByName('ScienceIcon')!.id} />,
    title: () => 'React',
    useDescription: () => React.version,
    type: 'pressable',
}

export default ReactVersionSetting
