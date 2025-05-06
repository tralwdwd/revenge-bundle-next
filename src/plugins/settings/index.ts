import { PluginFlags } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

import { waitForModules } from '@revenge-mod/modules/finders'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'

import { _data, _subs } from '@revenge-mod/discord/_/settings'
import { type SettingsItem, onceSettingsModulesLoaded } from '@revenge-mod/discord/settings'

import { after } from '@revenge-mod/patcher'

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
        start({ logger }) {
            onceSettingsModulesLoaded(() => require('./register'))

            const unsubForRendererConfig = waitForModules(
                byProps<{
                    SETTING_RENDERER_CONFIG: Record<string, SettingsItem>
                }>('SETTING_RENDERER_CONFIG'),
                (_, SettingRendererConfig) => {
                    unsubForRendererConfig()

                    logger.info('Settings modules loaded, running subscriptions and patching...')

                    for (const sub of _subs) sub()
                    // We don't ever need to call this again
                    _subs.clear()
                    _data[2] = true

                    let ORIGINAL_RENDERER_CONFIG = SettingRendererConfig.SETTING_RENDERER_CONFIG

                    Object.defineProperty(SettingRendererConfig, 'SETTING_RENDERER_CONFIG', {
                        get: () =>
                            ({
                                ...ORIGINAL_RENDERER_CONFIG,
                                ..._data[1],
                            }) as Record<string, SettingsItem>,
                        set: v => (ORIGINAL_RENDERER_CONFIG = v),
                    })
                },
            )

            const unsubForSettingsOverviewScreen = waitForModules(
                byName('SettingsOverviewScreen'),
                (_, exports) => {
                    unsubForSettingsOverviewScreen()

                    after(exports as { default: FC }, 'default', tree => {
                        const sections = (tree as Extract<typeof tree, { props: unknown }>).props.sections as Array<{
                            label: string
                            settings: string[]
                        }>

                        const customSections = _data[0]

                        // Check if we even have custom sections
                        const firstCustomSection = customSections[Object.keys(customSections)[0]]
                        if (!firstCustomSection) return tree

                        // Check if sections are already spliced
                        const firstCustomItem = firstCustomSection.settings[0]
                        if (
                            sections.findIndex(section =>
                                section.settings.some(setting => setting === firstCustomItem),
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
