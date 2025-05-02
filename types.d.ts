// Type definitions for things in this codebase ONLY!

declare global {
    const __BUILD_ENV__: 'development' | 'production'
    const __BUILD_COMMIT__: string
    const __BUILD_BRANCH__: string
    const __BUILD_VERSION__: string

    const __BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__: boolean
}

export {}
