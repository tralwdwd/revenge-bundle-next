import type {
    SettingsItem,
    SettingsModulesLoadedSubscription,
    SettingsSection,
} from '.'

export const sData = [
    // Sections to splice in the SettingsOverviewScreen
    {},
    // SETTING_RENDERER_CONFIG settings
    {},
    false,
] as [
    sections: Record<string, SettingsSection>,
    config: Record<string, SettingsItem>,
    loaded: boolean,
]

export const sSubscriptions = new Set<SettingsModulesLoadedSubscription>()
