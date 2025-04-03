import { _instances, _targets } from '../../init/src/patches/proxy'

/**
 * Returns whether the object is a proxy
 * @param obj The object to check
 */
export function isProxy(obj: object) {
    return _instances.has(obj)
}

/**
 * Returns the target of the proxy
 * @param obj The proxy
 * @returns The target of the proxy
 */
export function getProxyTarget(obj: object) {
    return _targets.get(obj)
}

export type ProxifyOptions = {
    /**
     * The hint for the proxified value.
     *
     * @default 'function'
     */
    hint?: 'object' | 'function'
}

/**
 * Proxify a value.
 * @param signal The signal to use to get the value.
 * @param options The options to use for the proxified value.
 * @returns A proxified value that will be updated when the signal is updated.
 */
export function proxify(signal: () => unknown, options?: ProxifyOptions) {
    const handler = {
        // biome-ignore lint/complexity/noBannedTypes: Function is the right type here
        apply: (_, thisArg, argArray) => Reflect.apply(signal() as Function, thisArg, argArray),
        // biome-ignore lint/complexity/noBannedTypes: Function is the right type here
        construct: (_, argArray, newTarget) => Reflect.construct(signal() as Function, argArray, newTarget),
        defineProperty: (_, property, attributes) => Reflect.defineProperty(signal()!, property, attributes),
        deleteProperty: (_, p) => Reflect.deleteProperty(signal()!, p),
        get: (_, p, receiver) => Reflect.get(signal()!, p, receiver),
        getOwnPropertyDescriptor: (_, p) => Reflect.getOwnPropertyDescriptor(signal()!, p),
        getPrototypeOf: _ => Reflect.getPrototypeOf(signal()!),
        has: (_, p) => Reflect.has(signal()!, p),
        isExtensible: _ => Reflect.isExtensible(signal()!),
        ownKeys: _ => Reflect.ownKeys(signal()!),
        preventExtensions: _ => Reflect.preventExtensions(signal()!),
        set: (_, p, newValue, receiver) => Reflect.set(signal()!, p, newValue, receiver),
        setPrototypeOf: (_, v) => Reflect.setPrototypeOf(signal()!, v),
    } as ProxyHandler<object>

    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    return new Proxy((options?.hint === 'object' ? {} : function () {}) as any, handler)
}
