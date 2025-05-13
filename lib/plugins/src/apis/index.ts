import * as PatcherLibrary from '@revenge-mod/patcher'
import type { UnscopedInitPluginApi, UnscopedPluginApi } from '../types'

export const _uapi: UnscopedInitPluginApi | UnscopedPluginApi = {
    discord: require('./discord').discord,
    externals: require('./externals').externals,
    modules: require('./modules').modules,
    plugins: require('./plugins').plugins,
    patcher: PatcherLibrary,
    react: require('./react').react,
}
