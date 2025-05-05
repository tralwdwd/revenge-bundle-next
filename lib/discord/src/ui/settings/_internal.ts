import type { SettingsItem, SettingsModulesLoadedSubscription, SettingsSection } from './api'

export const _data = [
    // Sections to splice in the SettingsOverviewScreen
    {},
    // SETTING_RENDERER_CONFIG settings
    {},
    false,
] as [sections: Record<string, SettingsSection>, config: Record<string, SettingsItem>, loaded: boolean]

export const _subs = new Set<SettingsModulesLoadedSubscription>()
