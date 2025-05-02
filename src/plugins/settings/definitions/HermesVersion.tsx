import { getAssetByName } from '@revenge-mod/assets'

import { Components } from '@revenge-mod/discord/ui'
import { addSettingsRow } from '@revenge-mod/discord/ui/settings'

import { React } from '@revenge-mod/react'

import { REVENGE } from './Revenge'

export const HERMES_VERSION = 'HERMES_VERSION'

// @ts-expect-error
const props = HermesInternal.getRuntimeProperties()

addSettingsRow(HERMES_VERSION, {
    parent: REVENGE,
    IconComponent: () => <Components.TableRow.Icon source={getAssetByName('ClipboardListIcon')!.id} />,
    title: () => 'Hermes',
    useDescription: () => `${props['Bytecode Version']} (${props.Build})`,
    type: 'pressable',
})
