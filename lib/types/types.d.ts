// All of these typings are exported, be careful what you export here!

import type { Metro } from '@revenge-mod/modules/types'
import type { Buffer as _Buffer } from 'buffer'
import type { ErrorUtils as RNErrorUtils } from 'react-native'

/// HERMES

declare global {
    declare function setTimeout(cb: (...args: unknown[]) => unknown, timeout?: number): number
    /**
     * Calls the garbage collector
     */
    declare function gc(): void

    interface HermesInternalObject {
        getRuntimeProperties(): Record<string, string>
        // biome-ignore lint/complexity/noBannedTypes: You can pass any function here
        getFunctionLocation(fn: Function): {
            fileName: string
            lineNumber: number
            columnNumber: number
            segmentID: number
            virtualOffset: number
            isNative: boolean
        }
    }
}

/// HERMES PROMISES

declare global {
    interface Promise {
        /// PROMISE POLYFILLS FROM: https://github.com/then/promise
        /// AND: https://github.com/facebook/hermes/blob/main/lib/InternalBytecode/01-Promise.js
        _h: 0 | 1 | 2
    }

    type HermesPromiseRejectionHandler = (promise: Promise<any>, error: any) => void

    interface PromiseConstructor {
        _m: HermesPromiseRejectionHandler
    }
}

/// REACT DEVTOOLS

declare global {
    var __REACT_DEVTOOLS_GLOBAL_HOOK__: unknown | undefined
    var __REACT_DEVTOOLS__:
        | {
              version: string
              exports: {
                  connectToDevTools(opts: {
                      host?: string
                      port?: number
                      websocket?: WebSocket
                  }): void
              }
          }
        | undefined
}

/// METRO

declare global {
    var nativeModuleProxy: Record<string, unknown>
    var __r: Metro.RequireFn
    var __c: Metro.ClearFn
    var __d: Metro.DefineFn
}

/// REACT NATIVE

declare global {
    declare function nativeLoggingHook(str: string, level: number): void
    declare function alert(message: unknown): void

    var nativePerformanceNow: typeof performance.now
    var performance: {
        now(): number
    }

    var globalEvalWithSourceUrl: (code: string, sourceURL: string) => any

    const ErrorUtils: RNErrorUtils
}

/// POLYFILLS

declare global {
    var Buffer: typeof _Buffer
}

export namespace ReactNative {
    namespace AssetsRegistry {
        export type AssetDestPathResolver = 'android' | 'generic'

        export interface PackagerAsset {
            __packager_asset: boolean
            fileSystemLocation?: string
            httpServerLocation?: string
            width?: number
            height?: number
            scales: number[]
            hash: string
            name: string
            type: string
            resolver?: AssetDestPathResolver
        }

        // Revenge-added
        export interface PackagerAsset {
            id: number
        }
    }

    export interface AssetsRegistry {
        registerAsset(asset: AssetsRegistry.PackagerAsset): number
        getAssetByID(assetId: number): AssetsRegistry.PackagerAsset
    }
}
