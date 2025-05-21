import type { StackNavigationOptions } from '@react-navigation/stack'
import type { ComponentType } from 'react'
import type { MobileSetting, UserSettingsSections } from './constants'

declare module '@revenge-mod/externals/react-navigation' {
    interface ReactNavigationParamList extends RevengeSettingsParamList {}
}

type RevengeSettingsParamList = {
    [K in (typeof UserSettingsSections)[keyof typeof UserSettingsSections]]: object
} & {
    [K in (typeof UserSettingsSections)[(typeof MobileSetting)['REVENGE_CUSTOM_PAGE']]]: {
        render: ComponentType
        options?: StackNavigationOptions
    }
}
