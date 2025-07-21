import { sRefresher, sSections } from '@revenge-mod/discord/_/modules/settings'
import { onSettingsModulesLoaded } from '@revenge-mod/discord/modules/settings'
import { byName } from '@revenge-mod/modules/finders/filters'
import {
    waitForModuleByImportedPath,
    waitForModules,
} from '@revenge-mod/modules/finders/wait'
import { instead } from '@revenge-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { useEffect } from 'react'
import type { FC } from 'react'

import './register-routes'
import { React } from '@revenge-mod/react'
import { noop } from '@revenge-mod/utils/callback'
import { useReRender } from '@revenge-mod/utils/react'

const pluginSettings = registerPlugin(
    {
        id: 'revenge.settings',
        name: 'Settings',
        description: 'Settings UI for Revenge.',
        author: 'Revenge',
        icon: 'SettingsIcon',
    },
    {
        start() {
            onSettingsModulesLoaded(() => {
                require('./register')
            })

            waitForModuleByImportedPath(
                'modules/main_tabs_v2/native/settings/SettingsNavigator.tsx',
                exports => {
                    patchSettingsNavigator(exports)
                },
            )

            const unsubSOS = waitForModules(
                byName('SettingsOverviewScreen'),
                exports => {
                    unsubSOS()
                    patchSettingsOverviewScreen(exports)
                },
                {
                    returnNamespace: true,
                },
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal | InternalPluginFlags.Essential,
)

function patchSettingsNavigator(exports: any) {
    instead(exports.default, 'type', (args, orig) => {
        const reRender = useReRender()
        useEffect(() => {
            sRefresher.callNavigator = reRender
            return () => {
                sRefresher.navigator = false
                sRefresher.callNavigator = noop
            }
        }, [reRender])

        // useMemo(() => getSettingScreens(), [])
        const unpatchMemo = instead(React, 'useMemo', (args, orig) => {
            if (!args[1]?.length && sRefresher.navigator) args[1] = undefined
            return Reflect.apply(orig, React, args)
        })

        const fiber = Reflect.apply(orig, undefined, args)
        unpatchMemo()
        return fiber
    })
}

function patchSettingsOverviewScreen(exports: any) {
    instead(
        exports as {
            default: FC
        },
        'default',
        (args, orig) => {
            const reRender = useReRender()
            useEffect(() => {
                sRefresher.callOverviewScreen = reRender
                return () => {
                    sRefresher.overviewScreen = false
                    sRefresher.callOverviewScreen = noop
                }
            }, [reRender])

            // In: SearchableSettingsList
            // useMemo(() => {
            //   return doSettingsBlocklistFiltering(props.sections, canShowNitroSettings)
            // }, [canShowNitroSettings])
            const unpatchMemo = instead(React, 'useMemo', (args, orig) => {
                if (sRefresher.overviewScreen) args[1] = undefined

                const sections = Reflect.apply(orig, React, args)

                // Add our custom sections here
                for (const section of Object.values(sSections))
                    if (section.index)
                        sections.splice(section.index, 0, section)
                    else sections.unshift(section)

                return sections
            })

            const tree = Reflect.apply(orig, undefined, args)
            unpatchMemo()
            return tree
        },
    )
}

export default pluginSettings
