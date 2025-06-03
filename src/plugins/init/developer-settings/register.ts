import {
    addSettingsItemToSection,
    registerSettingsItems,
} from '@revenge-mod/discord/modules/settings'
import { api } from '.'
import { MobileSetting } from './constants'
import AssetBrowserSetting from './definitions/AssetBrowserSetting'
import EvaluateJavaScriptSetting from './definitions/EvaluateJavaScriptSetting'
import ReactDevToolsAutoConnectSetting from './definitions/ReactDevToolsAutoConnectSetting'
import ReactDevToolsConnectSetting from './definitions/ReactDevToolsConnectSetting'
import ReactDevToolsDisconnectSetting from './definitions/ReactDevToolsDisconnectSetting'
import ReactDevToolsVersionSetting from './definitions/ReactDevToolsVersionSetting'
import RevengeDeveloperSetting from './definitions/RevengeDeveloperSetting'

export function register() {
    api.cleanup(
        registerSettingsItems({
            [MobileSetting.REVENGE_DEVELOPER]: RevengeDeveloperSetting,
            [MobileSetting.REACT_DEVTOOLS_VERSION]: ReactDevToolsVersionSetting,
            [MobileSetting.REACT_DEVTOOLS_AUTO_CONNECT]:
                ReactDevToolsAutoConnectSetting,
            [MobileSetting.REACT_DEVTOOLS_CONNECT]: ReactDevToolsConnectSetting,
            [MobileSetting.REACT_DEVTOOLS_DISCONNECT]:
                ReactDevToolsDisconnectSetting,
            [MobileSetting.EVALUATE_JAVASCRIPT]: EvaluateJavaScriptSetting,
            [MobileSetting.ASSET_BROWSER]: AssetBrowserSetting,
        }),
        addSettingsItemToSection('REVENGE', MobileSetting.REVENGE_DEVELOPER),
    )
}
