import { PluginFlags, type PluginApi } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

import { waitForModules } from '@revenge-mod/modules/finders'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'

import { _suiData } from '@revenge-mod/discord/_/ui/settings'

import { after } from '@revenge-mod/patcher'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'
import type { FC } from 'react'

registerPlugin(
    {
        id: 'revenge.settings',
        name: 'Settings',
        description: 'Settings menus for Revenge',
        author: 'Revenge',
        icon: 'SettingsIcon',
    },
    {
        start(api) {
            pluginApi = api

            const unsubForRendererConfig = waitForModules(byProps('SETTING_RENDERER_CONFIG'), (_, exports) => {
                unsubForRendererConfig()

                require('./register')

                const SettingRendererConfig = exports as {
                    SETTING_RENDERER_CONFIG: Record<string, SettingsItem>
                }

                let ORIGINAL_RENDERER_CONFIG = SettingRendererConfig.SETTING_RENDERER_CONFIG

                Object.defineProperty(SettingRendererConfig, 'SETTING_RENDERER_CONFIG', {
                    get: () =>
                        ({
                            ...ORIGINAL_RENDERER_CONFIG,
                            ..._suiData.config,
                        }) as Record<string, SettingsItem>,
                    set: v => (ORIGINAL_RENDERER_CONFIG = v),
                })
            })

            const unsubForSettingsOverviewScreen = waitForModules(
                byName('SettingsOverviewScreen'),
                (_, exports) => {
                    unsubForSettingsOverviewScreen()

                    after(exports as { default: FC }, 'default', tree => {
                        const sections = (tree as Extract<typeof tree, { props: unknown }>).props.sections as Array<{
                            label: string
                            settings: string[]
                        }>

                        const FirstCustomRow = Object.keys(
                            _suiData.sections[Object.keys(_suiData.sections)[0]].settings,
                        )[0]

                        if (
                            // No custom rows
                            !FirstCustomRow ||
                            // Section already added
                            sections.findIndex(section =>
                                section.settings.some(setting => setting === FirstCustomRow),
                            ) !== -1
                        )
                            return tree

                        for (const section of Object.values(_suiData.sections))
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

// Expose to EvaluateJavaScriptSetting
export let pluginApi: PluginApi
