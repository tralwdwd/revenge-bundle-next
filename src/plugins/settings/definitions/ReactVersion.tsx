import { getAssetByName } from '@revenge-mod/assets'

import { Components } from '@revenge-mod/discord/ui'
import { addSettingsRow } from '@revenge-mod/discord/ui/settings'

import { React } from '@revenge-mod/react'

import { REVENGE } from './Revenge'

export const REACT_VERSION = 'REACT_VERSION'

addSettingsRow(REACT_VERSION, {
    parent: REVENGE,
    IconComponent: () => <Components.TableRow.Icon source={getAssetByName('ScienceIcon')!.id} />,
    title: () => 'React',
    useDescription: () => React.version,
    type: 'pressable',
})
