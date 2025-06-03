import * as PatcherLibrary from '@revenge-mod/patcher'
import type {
    UnscopedInitPluginApi,
    UnscopedPluginApi,
    UnscopedPreInitPluginApi,
} from '../types'

export const _uapi:
    | UnscopedPreInitPluginApi
    | UnscopedInitPluginApi
    | UnscopedPluginApi = {
    modules: require('./modules').modules,
    plugins: require('./plugins').plugins,
    patcher: PatcherLibrary,
}
