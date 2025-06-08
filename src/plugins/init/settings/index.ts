import { _data, _subs } from '@revenge-mod/discord/_/modules/settings'
import { onSettingsModulesLoaded } from '@revenge-mod/discord/modules/settings'
import { ReactNavigationNative } from '@revenge-mod/externals/react-navigation'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'
import { after } from '@revenge-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { findInTree } from '@revenge-mod/utils/trees'
import type { NavigationState } from '@react-navigation/core'
import type { StackScreenProps } from '@react-navigation/stack'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'
import type { FC } from 'react'

onSettingsModulesLoaded(() => require('./register'))

registerPlugin(
    {
        id: 'revenge.settings',
        name: 'Settings',
        description: 'Settings menus for Revenge',
        author: 'Revenge',
        icon: 'SettingsIcon',
    },
    {
        init() {
            const unsub = waitForModules(
                byProps('getRootNavigationRef'),
                exports => {
                    unsub()
                    navigation = exports.getRootNavigationRef()
                },
            )
        },
        start({ logger }) {
            const unsubRC = waitForModules(
                byProps<{
                    SETTING_RENDERER_CONFIG: Record<string, SettingsItem>
                }>('SETTING_RENDERER_CONFIG'),
                SettingRendererConfig => {
                    unsubRC()

                    logger.info(
                        'Settings modules loaded, running subscriptions and patching...',
                    )

                    for (const sub of _subs)
                        try {
                            sub()
                        } catch (e) {
                            logger.error(
                                'Failed to run settings modules subscription',
                                e,
                            )
                        }

                    // We don't ever need to call this again
                    _subs.clear()
                    _data[2] = true

                    let ORIGINAL_RENDERER_CONFIG =
                        SettingRendererConfig.SETTING_RENDERER_CONFIG

                    Object.defineProperty(
                        SettingRendererConfig,
                        'SETTING_RENDERER_CONFIG',
                        {
                            get: () =>
                                ({
                                    ...ORIGINAL_RENDERER_CONFIG,
                                    ..._data[1],
                                }) as Record<string, SettingsItem>,
                            set: v => (ORIGINAL_RENDERER_CONFIG = v),
                        },
                    )
                },
            )

            const unsubSOS = waitForModules(
                byName('SettingsOverviewScreen'),
                exports => {
                    unsubSOS()

                    const customSections = _data[0]

                    after(exports as { default: FC }, 'default', tree => {
                        const {
                            props: { sections },
                        } = tree as {
                            props: {
                                sections: Array<{
                                    label: string
                                    settings: string[]
                                }>
                            }
                        }

                        // Check if we even have custom sections
                        const firstCustomSection =
                            customSections[Object.keys(customSections)[0]]
                        if (!firstCustomSection) return tree

                        // Check if sections are already spliced
                        const firstCustomItem = firstCustomSection.settings[0]
                        if (
                            sections.findIndex(section =>
                                section.settings.some(
                                    setting => setting === firstCustomItem,
                                ),
                            ) !== -1
                        )
                            return tree

                        for (const section of Object.values(customSections))
                            if (!section.index) sections.unshift(section)
                            else sections.splice(section.index, 0, section)

                        return tree
                    })
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

let navigation: ReturnType<
    typeof ReactNavigationNative.useNavigation<
        StackScreenProps<
            {
                tabs: undefined
                settings:
                    | {
                          screen: string
                          params?: Record<string, unknown>
                      }
                    | undefined
            },
            'settings'
        >['navigation']
    >
>

export function resetSettingsScreen() {
    const prevState = navigation.getState()
    const settings = findInTree(prevState, node => node.name === 'settings') as
        | { state: NavigationState }
        | undefined

    // We're currently not on the settings screen, so we don't need to reset
    if (!settings) return

    navigation.navigate('tabs')

    setTimeout(() => {
        // This navigates to the right screen, but then navigates back to the overview screen for some reason
        navigation.dispatch(
            ReactNavigationNative.CommonActions.reset(prevState),
        )

        // So we need to re-push all the routes
        setTimeout(() => {
            for (const route of settings.state.routes.slice(1))
                navigation.dispatch(
                    ReactNavigationNative.CommonActions.navigate(
                        route.name,
                        route.params,
                    ),
                )
        })
    })
}
