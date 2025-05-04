export const MobileSetting = {
    // MAIN SETTINGS

    REVENGE: 'REVENGE',
    REVENGE_PLUGINS: 'REVENGE_PLUGINS',
    REVENGE_THEMES: 'REVENGE_THEMES',
    REVENGE_FONTS: 'REVENGE_FONTS',
    REVENGE_DEVELOPER: 'REVENGE_DEVELOPER',

    // SUBSETTINGS

    REVENGE_VERSION: 'REVENGE_VERSION',
    REACT_VERSION: 'REACT_VERSION',
    REACT_NATIVE_VERSION: 'REACT_NATIVE_VERSION',
    HERMES_VERSION: 'HERMES_VERSION',

    CALL_GARBAGE_COLLECTOR: 'CALL_GARBAGE_COLLECTOR',
    TRIGGER_ERROR_BOUNDARY: 'TRIGGER_ERROR_BOUNDARY',

    REVENGE_NOT_IMPLEMENTED: 'REVENGE_NOT_IMPLEMENTED',
} as const

export const UserSettingsSections = {
    [MobileSetting.REVENGE]: 'Revenge',
    [MobileSetting.REVENGE_PLUGINS]: 'Revenge Plugins',
    [MobileSetting.REVENGE_THEMES]: 'Revenge Themes',
    [MobileSetting.REVENGE_FONTS]: 'Revenge Fonts',
    [MobileSetting.REVENGE_DEVELOPER]: 'Revenge Developer',
    [MobileSetting.TRIGGER_ERROR_BOUNDARY]: 'Trigger Error Boundary',
} as const

export const AlwaysHidden = () => false
