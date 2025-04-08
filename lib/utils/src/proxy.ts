import { _targets } from '../../init/src/patches/proxy'

/**
 * Returns whether the object is a proxy
 * @param obj The object to check
 */
export function isProxy(obj: object) {
    return _targets.has(obj)
}

/**
 * Returns the target of the proxy
 * @param obj The proxy
 * @returns The target of the proxy
 */
export function getProxyTarget(obj: object) {
    return _targets.get(obj)
}

const proxifyMetadatas = new WeakMap<object, [() => unknown, cacheable: boolean, cache?: unknown]>()

const proxifyHandler = Object.fromEntries(
    Object.entries(Reflect).map(([k, fn]) => [
        k,
        (hint: object, ...args: any[]) => {
            const m = proxifyMetadatas.get(hint)!
            // @ts-expect-error
            if (m[1]) return fn(m[2] ?? (m[2] = m[0]()), ...args)
            // @ts-expect-error
            return fn(m[0](), ...args)
        },
    ]),
) as ProxyHandler<object>

export type ProxifyOptions = {
    /**
     * The hint for the proxified value.
     *
     * @default 'function'
     */
    hint?: 'object' | 'function'
    /**
     * Whether the proxified value should be cached.
     */
    cache?: boolean
}

/**
 * Proxify a value.
 * @param signal The signal to use to get the value.
 * @param options The options to use for the proxified value.
 * @returns A proxified value that will be updated when the signal is updated.
 */
export function proxify(signal: () => unknown, options?: ProxifyOptions) {
    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    const hint = (options?.hint === 'object' ? {} : function () {}) as any
    proxifyMetadatas.set(hint, [signal, options?.cache ?? false])
    return new Proxy(hint, proxifyHandler)
}
