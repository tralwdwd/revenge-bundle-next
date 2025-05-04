import { registerSettingsItems, registerSettingsSection } from '@revenge-mod/discord/ui/settings'

import { MobileSetting } from './SettingsConstants'

import RevengeSetting from './definitions/RevengeSetting'
// import RevengePluginsSetting from './definitions/RevengePluginsSetting'
// import RevengeThemesSetting from './definitions/RevengeThemesSetting'
// import RevengeFontsSetting from './definitions/RevengeFontsSetting'
import RevengeDeveloperSetting from './definitions/RevengeDeveloperSetting'
import ReactVersionSetting from './definitions/ReactVersionSetting'
import ReactNativeVersionSetting from './definitions/ReactNativeVersionSetting'
import RevengeVersionSetting from './definitions/RevengeVersionSetting'
import HermesVersionSetting from './definitions/HermesVersionSetting'
import RevengeNotImplementedSetting from './definitions/RevengeNotImplementedSetting'
import EvaluateJavaScriptSetting from './definitions/EvaluateJavaScriptSetting'

registerSettingsItems({
    [MobileSetting.REVENGE]: RevengeSetting,
    // [MobileSetting.REVENGE_PLUGINS]: RevengePluginsSetting,
    // [MobileSetting.REVENGE_THEMES]: RevengeThemesSetting,
    // [MobileSetting.REVENGE_FONTS]: RevengeFontsSetting,
    [MobileSetting.REVENGE_DEVELOPER]: RevengeDeveloperSetting,
    [MobileSetting.REVENGE_VERSION]: RevengeVersionSetting,
    [MobileSetting.REACT_VERSION]: ReactVersionSetting,
    [MobileSetting.REACT_NATIVE_VERSION]: ReactNativeVersionSetting,
    [MobileSetting.HERMES_VERSION]: HermesVersionSetting,
    [MobileSetting.EVALUATE_JAVASCRIPT]: EvaluateJavaScriptSetting,
    [MobileSetting.REVENGE_NOT_IMPLEMENTED]: RevengeNotImplementedSetting,
})

registerSettingsSection('REVENGE', {
    label: 'Revenge',
    settings: [
        MobileSetting.REVENGE,
        // MobileSetting.REVENGE_PLUGINS,
        // MobileSetting.REVENGE_THEMES,
        // MobileSetting.REVENGE_FONTS,
        MobileSetting.REVENGE_DEVELOPER,
    ],
})
