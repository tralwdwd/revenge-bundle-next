import type { SettingsRowConfig, SettingsSection } from './api'

export const _suiData = {
    // Settings that are in the Overview screen
    sections: {},
    // Settings that are not in the Overview screen (submenus, hidden, etc.)
    settings: {},
} as {
    sections: Record<string, SettingsSection>
    settings: Record<string, SettingsRowConfig>
}
