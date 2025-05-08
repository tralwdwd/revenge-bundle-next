import { lookupModule } from '@revenge-mod/modules/finders'
import { byDependencies, byProps, looseDeps, moduleStateAware, relativeDep } from '@revenge-mod/modules/finders/filters'

import { proxify } from '@revenge-mod/utils/proxy'

import type { DiscordModules } from '../../../types'

// design/native.tsx
let components: Components = proxify(
    () => {
        // ID: 3236
        // [3237, 1366, 3238, 3239, 2, ...];
        const module = lookupModule(
            moduleStateAware(
                byProps<Components>('TableRow', 'Button'),
                byDependencies(looseDeps([relativeDep(1), undefined, relativeDep(2), relativeDep(3), 2])),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            components = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!

export default components

export interface Components {
    ActionSheet: DiscordModules.Components.ActionSheet
    ActionSheetRow: DiscordModules.Components.ActionSheetRow
    ActionSheetSwitchRow: DiscordModules.Components.ActionSheetSwitchRow
    AlertActionButton: DiscordModules.Components.AlertActionButton
    AlertModal: DiscordModules.Components.AlertModal
    Button: DiscordModules.Components.Button
    Card: DiscordModules.Components.Card
    ContextMenu: DiscordModules.Components.ContextMenu
    ContextMenuItem: DiscordModules.Components.ContextMenuItem
    FormSwitch: DiscordModules.Components.FormSwitch
    IconButton: DiscordModules.Components.IconButton
    ImageButton: DiscordModules.Components.ImageButton
    Stack: DiscordModules.Components.Stack
    Slider: DiscordModules.Components.Slider
    TableRow: DiscordModules.Components.TableRow
    TableRowGroup: DiscordModules.Components.TableRowGroup
    TableRowTrailingText: DiscordModules.Components.TableRowTrailingText
    TableSwitchRow: DiscordModules.Components.TableSwitchRow
    Text: DiscordModules.Components.Text
    TextArea: DiscordModules.Components.TextArea
    TextField: DiscordModules.Components.TextField
    TextInput: DiscordModules.Components.TextInput
}
