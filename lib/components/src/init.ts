/** biome-ignore-all lint/complexity/useArrowFunction: Rolldown issue: Bug requires us to use normal functions instead of arrow functions */

import { _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'

const uapi = _uapi as UnscopedInitPluginApi

defineLazyProperty(uapi, 'components', function () {
    return require('./index')
})
