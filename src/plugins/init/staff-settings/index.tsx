import { getStore, Stores } from '@revenge-mod/discord/common/flux'
import { refreshSettingsOverviewScreen } from '@revenge-mod/discord/modules/settings'
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
        start({ cleanup, logger }) {
            function reset() {
                getStore<{ initialize(): void }>(
                    'DeveloperExperimentStore',
                    store => {
                        logger.log(
                            'Reinitializing DeveloperExperimentStore to apply changes...',
                        )

                        const unpatch = instead(
                            Object,
                            'defineProperties',
                            args => args[0],
                        )

                        store.initialize()
                        unpatch()

                        setImmediate(() => refreshSettingsOverviewScreen(true))
                    },
                )
            }

            cleanup(
                getModule(byProps('isStaffEnv'), UserStoreUtils => {
                    logger.log('Patching UserStoreUtils...')

                    cleanup(
                        instead(
                            UserStoreUtils,
                            'isStaffEnv',
                            ([user]) =>
                                user === Stores.UserStore.getCurrentUser(),
                        ),
                        reset,
                    )

                    reset()
                }),
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
