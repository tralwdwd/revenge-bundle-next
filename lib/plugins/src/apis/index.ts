import * as PatcherLibrary from '@revenge-mod/patcher'
import * as PluginsLibrary from '@revenge-mod/plugins'

import type { UnscopedInitPluginApi, UnscopedPluginApi } from '../types'

export const _uapi: UnscopedInitPluginApi | UnscopedPluginApi = {
    get discord() {
        return (this.discord = require('./discord').discord)
    },
    get externals() {
        return (this.externals = require('./externals').externals)
    },
    get modules() {
        return (this.modules = require('./modules').modules)
    },
    patcher: PatcherLibrary,
    plugins: PluginsLibrary,
    get react() {
        return (this.react = require('./react').react)
    },
}
