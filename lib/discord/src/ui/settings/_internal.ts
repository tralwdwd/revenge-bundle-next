import type { SettingsRowConfig, SettingsSection } from './api'

export const _suiData = {
    // Sections to splice in the SettingsOverviewScreen
    sections: {},
    // SETTING_RENDERER_CONFIG settings
    config: {},
} as {
    sections: Record<string, SettingsSection>
    config: Record<string, SettingsRowConfig>
}
