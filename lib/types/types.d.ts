// All of these typings are exported, be careful what you export here!

/// <reference path="../../node_modules/react-native/types/index.d.ts" />

import type { Metro } from '@revenge-mod/modules/types'

/// HERMES

declare global {
    function setTimeout(cb: (...args: unknown[]) => unknown, timeout?: number): number
    /**
     * Calls the garbage collector
     */
    function gc(): void

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
    interface Promise<T> {
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
    function nativeLoggingHook(str: string, level: number): void
    function alert(message: unknown): void

    var nativePerformanceNow: typeof performance.now
    var performance: {
        now(): number
    }

    var globalEvalWithSourceUrl: (code: string, sourceURL: string) => any
}
