import { _uapi } from '@revenge-mod/plugins/_'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import type { UnscopedInitPluginApi } from '@revenge-mod/plugins/types'

const uapi = _uapi as UnscopedInitPluginApi

// ROLLDOWN ISSUE: Requires us to do () => { return require(...) } instead of () => require(...)

defineLazyProperty(uapi, 'components', () => {
    return require('.')
})
