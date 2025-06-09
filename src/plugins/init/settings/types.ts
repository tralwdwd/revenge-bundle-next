import type { StackNavigationOptions } from '@react-navigation/stack'
import type { ComponentType } from 'react'
import type { RouteNames, Setting } from './constants'

declare module '@revenge-mod/externals/react-navigation' {
    interface ReactNavigationParamList extends RevengeSettingsParamList {}
}

type RevengeSettingsParamList = {
    [K in (typeof RouteNames)[keyof typeof RouteNames]]: object
} & {
    [K in (typeof RouteNames)[(typeof Setting)['RevengeCustomPage']]]: {
        render: ComponentType
        options?: StackNavigationOptions
    }
}
