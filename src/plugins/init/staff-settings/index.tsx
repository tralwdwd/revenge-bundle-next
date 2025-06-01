import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { Stores, getStore } from '@revenge-mod/discord/common/flux'
import { Design } from '@revenge-mod/discord/design'

import { byProps } from '@revenge-mod/modules/finders/filters'
import { getModule } from '@revenge-mod/modules/finders/get'

import { instead } from '@revenge-mod/patcher'

import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'

registerPlugin(
    {
        id: 'revenge.staff-settings',
        name: 'Staff Settings',
        description: "Allows accessing Discord's Staff Settings.",
        author: 'Revenge',
        icon: 'StaffBadgeIcon',
    },
    {
        start({ cleanup, logger, plugin }) {
            if (plugin.flags & PluginFlags.EnabledLate) showNoticeAlert()

            function reinitDEStore() {
                cleanup(
                    getStore<{ initialize(): void }>('DeveloperExperimentStore', store => {
                        logger.log('Reinitializing DeveloperExperimentStore to apply changes...')

                        setTimeout(() => {
                            const unpatch = instead(Object, 'defineProperties', () => {})
                            store.initialize()
                            unpatch()
                        })
                    }),
                )
            }

            cleanup(
                getModule(byProps('isStaffEnv'), UserStoreUtils => {
                    logger.log('Patching UserStoreUtils...')

                    cleanup(
                        instead(UserStoreUtils, 'isStaffEnv', ([user]) => user === Stores.UserStore.getCurrentUser()),
                    )

                    reinitDEStore()
                }),
                reinitDEStore,
                showNoticeAlert,
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)

function showNoticeAlert() {
    AlertActionCreators.openAlert(
        'staff-settings-notice',
        <Design.AlertModal
            title="Notice"
            content="Close and open the Settings page again to apply changes."
            actions={<Design.AlertActionButton variant="secondary" text="Got it" />}
        />,
    )
}
