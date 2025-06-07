import * as patcher from '@revenge-mod/patcher'
import { modules } from './modules'
import { plugins } from './plugins'
import type {
    UnscopedInitPluginApi,
    UnscopedPluginApi,
    UnscopedPreInitPluginApi,
} from '../types'

export const _uapi:
    | UnscopedPreInitPluginApi
    | UnscopedInitPluginApi
    | UnscopedPluginApi = {
    modules,
    plugins,
    patcher,
}
