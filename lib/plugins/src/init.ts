import * as AssetsLibrary from '@revenge-mod/assets'
// import * as UiLibrary from '@revenge-mod/ui'

import { after } from '@revenge-mod/patcher'
import { ReactNative } from '@revenge-mod/react'

import { _uapi, initPlugins, startPlugins } from './_internal'

import type { UnscopedPluginApi } from './types'

// Setup non-limited APIs
const uapi = _uapi as UnscopedPluginApi
uapi.assets = AssetsLibrary
// uapi.ui = UiLibrary

initPlugins()

// TODO(plugins/init): move to @revenge-mod/app onAppInitialized
const unpatch = after(ReactNative.AppRegistry, 'runApplication', ret => {
    unpatch()
    setImmediate(startPlugins)
    return ret
})
