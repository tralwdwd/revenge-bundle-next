import * as AssetsLibrary from '@revenge-mod/assets'
// import * as UiLibrary from '@revenge-mod/ui'

import { after } from '@revenge-mod/patcher'
import { ReactNative } from '@revenge-mod/react'

import { initPlugins, startPlugins } from './_internal'
import { _uapi } from './apis'

import type { UnscopedPluginApi } from './types'

// Setup non-limited APIs
const uapi = _uapi as UnscopedPluginApi
uapi.assets = AssetsLibrary
// uapi.ui = UiLibrary

initPlugins()

// TODO(plugins/init): move to @revenge-mod/react/native onRunApplicationCalled
const unpatch = after(ReactNative.AppRegistry, 'runApplication', ret => {
    unpatch()
    // Don't block rendering
    setImmediate(startPlugins)
    return ret
})
