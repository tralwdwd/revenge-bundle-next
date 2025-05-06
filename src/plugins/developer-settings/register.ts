import { addSettingsItemToSection, registerSettingsItems } from '@revenge-mod/discord/settings'

import { MobileSetting } from './constants'

import EvaluateJavaScriptSetting from './definitions/EvaluateJavaScriptSetting'
import ReactDevToolsConnectSetting from './definitions/ReactDevToolsConnectSetting'
import ReactDevToolsDisconnectSetting from './definitions/ReactDevToolsDisconnectSetting'
import ReactDevToolsVersionSetting from './definitions/ReactDevToolsVersionSetting'
import RevengeDeveloperSetting from './definitions/RevengeDeveloperSetting'

registerSettingsItems({
    [MobileSetting.REVENGE_DEVELOPER]: RevengeDeveloperSetting,
    [MobileSetting.REACT_DEVTOOLS_VERSION]: ReactDevToolsVersionSetting,
    [MobileSetting.REACT_DEVTOOLS_CONNECT]: ReactDevToolsConnectSetting,
    [MobileSetting.REACT_DEVTOOLS_DISCONNECT]: ReactDevToolsDisconnectSetting,
    [MobileSetting.EVALUATE_JAVASCRIPT]: EvaluateJavaScriptSetting,
})

addSettingsItemToSection('REVENGE', MobileSetting.REVENGE_DEVELOPER)
