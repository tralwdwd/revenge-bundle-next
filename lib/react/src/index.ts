import { lookupModuleId, lookupModuleIds } from '@revenge-mod/modules/finders'
import { byProps } from '@revenge-mod/modules/finders/filters'
import { yielded } from '@revenge-mod/utils/generators'

export * as jsxRuntime from './jsx-runtime'
export * from '../types'

export const ReactModuleId = yielded(lookupModuleIds(byProps<typeof import('react')>('useState')), 1)!
export const ReactNativeModuleId = lookupModuleId(byProps<typeof import('react-native')>('AppRegistry'))!
export const ReactJsxRuntimeModuleId = yielded(lookupModuleIds(byProps<typeof import('react/jsx-runtime')>('jsx'))!, 1)

export const React = __r(ReactModuleId) as typeof import('react')
export const ReactNative = __r(ReactNativeModuleId) as typeof import('react-native')
export const ReactJsxRuntime = __r(ReactJsxRuntimeModuleId) as typeof import('react/jsx-runtime')
