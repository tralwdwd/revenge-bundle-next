// Type definitions for things in this codebase ONLY!

declare global {
    const __BUILD_ENV__: 'development' | 'production'
    const __BUILD_COMMIT__: string
    const __BUILD_BRANCH__: string
    const __BUILD_VERSION__: string

    const __BUILD_FLAG_LOG_PROMISE_REJECTIONS__: boolean

    // CommonJS modules, we don't want to depend on @types/node
    const module: {
        exports: any
    }

    export interface ImportMeta {
        glob<T = any>(
            pattern: ImportMetaGlobPattern,
            options?: ImportMetaGlobOptions,
        ): Record<string, () => Promise<T>>
        glob<T = any>(
            pattern: ImportMetaGlobPattern,
            options: Extract<ImportMetaGlobOptions, { eager: true }>,
        ): Record<string, T>
    }
}

interface ImportMetaGlobOptions {
    eager?: boolean
    import?: string
    query?: string | Record<string, string>
}

type ImportMetaGlobPattern = string | string[]

export {}
