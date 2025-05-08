import { registerSettingsItems, registerSettingsSection } from '@revenge-mod/discord/modules/settings'

import { MobileSetting } from './constants'

import HermesVersionSetting from './definitions/HermesVersionSetting'
import ReactNativeVersionSetting from './definitions/ReactNativeVersionSetting'
// import RevengePluginsSetting from './definitions/RevengePluginsSetting'
// import RevengeThemesSetting from './definitions/RevengeThemesSetting'
// import RevengeFontsSetting from './definitions/RevengeFontsSetting'
import ReactVersionSetting from './definitions/ReactVersionSetting'
import ReloadAppSetting from './definitions/ReloadAppSetting'
import RevengeDiscordServerSetting from './definitions/RevengeDiscordServerSetting'
import RevengeGitHubOrganizationSetting from './definitions/RevengeGitHubOrganizationSetting'
import RevengeNotImplementedSetting from './definitions/RevengeNotImplementedSetting'
import RevengeSetting from './definitions/RevengeSetting'
import RevengeVersionSetting from './definitions/RevengeVersionSetting'

registerSettingsItems({
    [MobileSetting.REVENGE]: RevengeSetting,
    // [MobileSetting.REVENGE_PLUGINS]: RevengePluginsSetting,
    // [MobileSetting.REVENGE_THEMES]: RevengeThemesSetting,
    // [MobileSetting.REVENGE_FONTS]: RevengeFontsSetting,
    [MobileSetting.REVENGE_GITHUB_ORGANIZATION]: RevengeGitHubOrganizationSetting,
    [MobileSetting.REVENGE_DISCORD_SERVER]: RevengeDiscordServerSetting,
    [MobileSetting.RELOAD_APP]: ReloadAppSetting,
    [MobileSetting.REVENGE_VERSION]: RevengeVersionSetting,
    [MobileSetting.REACT_VERSION]: ReactVersionSetting,
    [MobileSetting.REACT_NATIVE_VERSION]: ReactNativeVersionSetting,
    [MobileSetting.HERMES_VERSION]: HermesVersionSetting,
    [MobileSetting.REVENGE_NOT_IMPLEMENTED]: RevengeNotImplementedSetting,
})

registerSettingsSection('REVENGE', {
    label: 'Revenge',
    settings: [
        MobileSetting.REVENGE,
        // MobileSetting.REVENGE_PLUGINS,
        // MobileSetting.REVENGE_THEMES,
        // MobileSetting.REVENGE_FONTS,
    ],
})
