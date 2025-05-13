import { byProps } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'

import { after } from '@revenge-mod/patcher'

import { PluginFlags } from '@revenge-mod/plugins/constants'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

registerPlugin(
    {
        id: 'revenge.staff-settings',
        name: 'Staff Settings',
        description: "Allows accessing Discord's Staff Settings.",
        author: 'Revenge',
        icon: 'StaffBadgeIcon',
    },
    {
        init({ cleanup }) {
            const unsub = waitForModules(byProps('isStaffEnv'), (_, UserStoreUtils) => {
                unsub()
                cleanup(after(UserStoreUtils, 'isStaffEnv', () => true))
            })
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
