import { byProps } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'

import { instead } from '@revenge-mod/patcher'

import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'

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
        preInit({ cleanup }) {
            // modules/errors/native/SentryInitUtils.tsx
            const unsubSIU = waitForModules(byProps('initSentry'), SentryInitUtils => {
                unsubSIU()

                console.log('Patching SentryInitUtils...')
                cleanup(instead(SentryInitUtils, 'initSentry', () => {}))
                cleanup(() => SentryInitUtils.initSentry())
            })
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
                    cleanup(instead(AnalyticsUtils.default, 'track', () => {}))
                    cleanup(instead(AnalyticsUtils, 'trackNetworkAction', () => {}))

                    for (const key in AnalyticsUtils.default.AnalyticsActionHandlers)
                        cleanup(instead(AnalyticsUtils.default.AnalyticsActionHandlers, key, () => {}))
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
                    cleanup(instead(useTrackImpression, 'trackImpression', () => {}))
                    cleanup(instead(useTrackImpression, 'default', () => {}))
                },
            )
        },
    },
    PluginFlags.Enabled,
    // TODO(plugins/no-track): is it essential?
    InternalPluginFlags.Internal | InternalPluginFlags.Essential,
)
