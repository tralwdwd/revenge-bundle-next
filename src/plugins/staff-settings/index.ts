import { byProps } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'

import { instead } from '@revenge-mod/patcher'

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
            const unsub = waitForModules(byProps('isStaffEnv'), UserStoreUtils => {
                unsub()
                cleanup(instead(UserStoreUtils, 'isStaffEnv', () => true))
            })

            cleanup(unsub)
        },
        start({ plugin }) {
            if (plugin.flags & PluginFlags.EnabledLate) plugin.stop()
        },
        stop({ plugin }) {
            plugin.flags |= PluginFlags.ReloadRequired
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
