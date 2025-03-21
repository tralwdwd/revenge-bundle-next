// Type definitions for things in this codebase ONLY!

import type { Buffer as _Buffer } from 'buffer'
import type MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue'

declare global {
    // Discord has a Buffer polyfill that gets initialized a little later, be careful with this
    var Buffer: typeof _Buffer
}

declare global {
    const __BUILD_ENV__: 'development' | 'production'
    const __BUILD_COMMIT__: string

    const __BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__: boolean
}
