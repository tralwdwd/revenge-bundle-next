import { findModule } from '@revenge-mod/modules/finders'
import { byProps } from '@revenge-mod/modules/finders/filters'

import { after } from '@revenge-mod/patcher'

import { PluginFlags } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

registerPlugin(
    {
        id: 'revenge.staff-settings',
        name: 'Staff Settings',
        description: "Allows accessing Discord's Staff Settings.",
        icon: 'StaffBadgeIcon',
    },
    {
        async init({ cleanup }) {
            const UserStoreUtils = await findModule(byProps('isStaffEnv'))
            cleanup(after(UserStoreUtils, 'isStaffEnv', () => true))
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
