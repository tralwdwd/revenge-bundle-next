import { PluginFlags } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

import { waitForModules } from '@revenge-mod/modules/finders'
import { byName, byProps } from '@revenge-mod/modules/finders/filters'

import { registerSetting, registerSettingsSection, type SettingsRowConfig } from '@revenge-mod/discord/ui/settings'
import { _suiData } from '@revenge-mod/discord/_/ui/settings'

import { after } from '@revenge-mod/patcher'

import { MobileSetting } from './SettingsConstants'

import RevengeSetting from './definitions/RevengeSetting'
import RevengePluginsSetting from './definitions/RevengePluginsSetting'
import RevengeThemesSetting from './definitions/RevengeThemesSetting'
import RevengeFontsSetting from './definitions/RevengeFontsSetting'
import RevengeDeveloperSetting from './definitions/RevengeDeveloperSetting'
import ReactVersionSetting from './definitions/ReactVersionSetting'
import ReactNativeVersionSetting from './definitions/ReactNativeVersionSetting'
import RevengeVersionSetting from './definitions/RevengeVersionSetting'
import HermesVersionSetting from './definitions/HermesVersionSetting'
import CallGarbageCollectorSetting from './definitions/CallGarbageCollectorSetting'
import TriggerErrorBoundarySetting from './definitions/TriggerErrorBoundarySetting'
import RevengeNotImplementedSetting from './definitions/RevengeNotImplementedSetting'

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
        start() {
            for (const [key, setting] of [
                [MobileSetting.REVENGE, RevengeSetting],
                [MobileSetting.REVENGE_PLUGINS, RevengePluginsSetting],
                [MobileSetting.REVENGE_THEMES, RevengeThemesSetting],
                [MobileSetting.REVENGE_FONTS, RevengeFontsSetting],
                [MobileSetting.REVENGE_DEVELOPER, RevengeDeveloperSetting],
                [MobileSetting.REVENGE_VERSION, RevengeVersionSetting],
                [MobileSetting.REACT_VERSION, ReactVersionSetting],
                [MobileSetting.REACT_NATIVE_VERSION, ReactNativeVersionSetting],
                [MobileSetting.HERMES_VERSION, HermesVersionSetting],
                [MobileSetting.CALL_GARBAGE_COLLECTOR, CallGarbageCollectorSetting],
                [MobileSetting.TRIGGER_ERROR_BOUNDARY, TriggerErrorBoundarySetting],
                [MobileSetting.REVENGE_NOT_IMPLEMENTED, RevengeNotImplementedSetting],
            ] as Array<[string, SettingsRowConfig]>)
                registerSetting(key, setting)

            registerSettingsSection('REVENGE', {
                label: 'Revenge',
                settings: [
                    MobileSetting.REVENGE,
                    MobileSetting.REVENGE_PLUGINS,
                    MobileSetting.REVENGE_THEMES,
                    MobileSetting.REVENGE_FONTS,
                    MobileSetting.REVENGE_DEVELOPER,
                ],
            })

            const unsubForRendererConfig = waitForModules(byProps('SETTING_RENDERER_CONFIG'), (_, exports) => {
                unsubForRendererConfig()

                const SettingRendererConfig = exports as {
                    SETTING_RENDERER_CONFIG: Record<string, SettingsRowConfig>
                }

                let ORIGINAL_RENDERER_CONFIG = SettingRendererConfig.SETTING_RENDERER_CONFIG

                Object.defineProperty(SettingRendererConfig, 'SETTING_RENDERER_CONFIG', {
                    get: () =>
                        ({
                            ...ORIGINAL_RENDERER_CONFIG,
                            ..._suiData.config,
                        }) as Record<string, SettingsRowConfig>,
                    set: v => (ORIGINAL_RENDERER_CONFIG = v),
                })
            })

            const unsub = waitForModules(
                byName('SettingsOverviewScreen'),
                (_, exports) => {
                    unsub()

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
