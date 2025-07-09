import { DispatcherModuleId } from '@revenge-mod/discord/common/flux'
import { byProps } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'
import { getModuleDependencies } from '@revenge-mod/modules/metro/utils'
import { instead } from '@revenge-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { noop } from '@revenge-mod/utils/callbacks'

// TODO(plugins/no-track): Block Sentry native-side
registerPlugin(
    {
        id: 'revenge.no-track',
        name: 'No Track',
        description: "Disables Discord's analytics/tracking, and Sentry.",
        author: 'Revenge',
        icon: 'AnalyticsIcon',
    },
    {
        preInit({ cleanup, plugin }) {
            if (plugin.flags & PluginFlags.EnabledLate)
                plugin.flags |= PluginFlags.ReloadRequired

            // modules/errors/native/SentryInitUtils.tsx
            const unsubSIU = waitForModules(
                byProps('initSentry'),
                SentryInitUtils => {
                    unsubSIU()

                    console.log('Patching SentryInitUtils...')
                    instead(SentryInitUtils, 'initSentry', noop)
                },
            )

            // Discord uses ReactNavigationInstrumentation to track navigation
            const unsubSentry = waitForModules(
                byProps('ReactNavigationInstrumentation'),
                exports => {
                    unsubSentry()

                    console.log('Patching ReactNavigationInstrumentation...')
                    exports.ReactNavigationInstrumentation = class {
                        // https://docs.sentry.io/platforms/react-native/tracing/instrumentation/react-navigation/#initialization
                        registerNavigationContainer = noop
                    }
                },
            )

            // Make sure __SENTRY__ can never be set
            Object.defineProperty(globalThis, '__SENTRY__', {
                writable: false,
                configurable: false,
            })

            cleanup(unsubSIU, unsubSentry)
        },
        init({ cleanup, logger }) {
            // utils/AnalyticsUtils.tsx
            const unsubAU = waitForModules(
                byProps<{
                    trackNetworkAction: () => void
                    default: {
                        track: () => void
                        AnalyticsActionHandlers: Record<string, () => void>
                    }
                }>('trackNetworkAction'),
                AnalyticsUtils => {
                    unsubAU()

                    logger.info('Patching AnalyticsUtils...')
                    instead(AnalyticsUtils.default, 'track', noop)
                    instead(AnalyticsUtils, 'trackNetworkAction', noop)

                    for (const key in AnalyticsUtils.default
                        .AnalyticsActionHandlers)
                        instead(
                            AnalyticsUtils.default.AnalyticsActionHandlers,
                            key,
                            noop,
                        )
                },
            )

            // modules/app_analytics/useTrackImpression.tsx
            const unsubTI = waitForModules(
                byProps<{
                    default: () => void
                    trackImpression: () => void
                }>('trackImpression'),
                useTrackImpression => {
                    unsubTI()

                    logger.info('Patching useTrackImpression...')

                    instead(useTrackImpression, 'trackImpression', noop)
                    instead(useTrackImpression, 'default', noop)
                },
            )

            // actions/AnalyticsTrackActionCreators.tsx
            const unsubATAC = waitForModules(
                byProps('track'),
                (AnalyticsTrackActionCreators, id) => {
                    if (getModuleDependencies(id)![0] === DispatcherModuleId) {
                        unsubATAC()

                        logger.info('Patching AnalyticsTrackActionCreators...')
                        instead(AnalyticsTrackActionCreators, 'track', noop)
                    }
                },
            )

            cleanup(unsubAU, unsubTI, unsubATAC)
        },
        stop({ plugin }) {
            plugin.flags |= PluginFlags.ReloadRequired
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
