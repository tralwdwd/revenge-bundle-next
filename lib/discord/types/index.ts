export * from './native'

export namespace DiscordModules {
    export namespace Flux {
        export type DispatcherPayload = any
        export type DispatcherDependency = any

        export interface StoreChangeCallbacks {
            add(cb: () => void): void
            addConditional(cb: () => boolean): void
            listeners: Set<() => void>
            remove(cb: () => void): void
            has(cb: () => void): boolean
            hasAny(): boolean
            invokeAll(): void
        }

        export type Store<T = object> = T & {
            addChangeListener(cb: () => void): void
            removeChangeListener(cb: () => void): void
            addReactChangeListener(cb: () => void): void
            removeReactChangeListener(cb: () => void): void
            addConditionalChangeListener(cb: () => boolean): void

            callback(cb: () => void): void
            throttledCallback(): unknown

            getName(): string

            __getLocalVars?(): object

            _changeCallbacks: StoreChangeCallbacks
            _isInitialized: boolean
            _version: number
            _reactChangeCallbacks: StoreChangeCallbacks
            _dispatchToken: string
        }

        export interface Dispatcher {
            _actionHandlers: unknown
            _interceptors?: ((payload: DispatcherPayload) => undefined | boolean)[]
            _currentDispatchActionType: undefined | string
            _processingWaitQueue: boolean
            _subscriptions: Record<string, Set<(payload: DispatcherPayload) => void>>
            _waitQueue: unknown[]
            addDependencies(node1: DispatcherDependency, node2: DispatcherDependency): void
            dispatch(payload: DispatcherPayload): Promise<void>
            flushWaitQueue(): void
            isDispatching(): boolean
            register(
                name: string,
                actionHandler: Record<string, (e: DispatcherPayload) => void>,
                storeDidChange: (e: DispatcherPayload) => boolean,
            ): string
            setInterceptor(interceptor?: (payload: DispatcherPayload) => undefined | boolean): void
            /**
             * Subscribes to an action type
             * @param actionType The action type to subscribe to
             * @param callback The callback to call when the action is dispatched
             */
            subscribe(actionType: string, callback: (payload: DispatcherPayload) => void): void
            /**
             * Unsubscribes from an action type
             * @param actionType The action type to unsubscribe from
             * @param callback The callback to remove
             */
            unsubscribe(actionType: string, callback: (payload: DispatcherPayload) => void): void
            wait(cb: () => void): void
        }
    }

    /**
     * Discord's `Logger` class.
     *
     * Logs will be shown in the **Debug Logs** section in settings.
     */
    export interface Logger {
        new (
            tag: string,
        ): {
            log(...args: unknown[]): void
            error(...args: unknown[]): void
            warn(...args: unknown[]): void
            info(...args: unknown[]): void
            debug(...args: unknown[]): void
            time(...args: unknown[]): void
            trace(...args: unknown[]): void
            verbose(...args: unknown[]): void
        }
    }
}
