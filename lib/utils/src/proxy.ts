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

// Heavily inspired by Wintry's lazy utils, but more optimized and stripped down.
// https://github.com/pylixonly/wintry/blob/main/src/utils/lazy.ts

const _proxifyMetadatas = new WeakMap<object, [() => unknown, cacheable: boolean, cache?: unknown]>()

const _proxifyHandler = {
    ...Object.fromEntries(
        Object.getOwnPropertyNames(Reflect).map(k => [
            k,
            (hint: object, ...args: any[]) => {
                // @ts-expect-error
                const fn = Reflect[k]
                const meta = _proxifyMetadatas.get(hint)!
                if (meta[1]) return fn(meta[2] ?? (meta[2] = meta[0]()), ...args)
                return fn(meta[0](), ...args)
            },
        ]),
    ),
    // Workaround to fix functions that the correct `this`
    get: (hint, p, recv) => {
        const meta = _proxifyMetadatas.get(hint)!
        const metaTarget = meta[1] ? (meta[2] ?? (meta[2] = meta[0]())) : meta[0]()
        const val = Reflect.get(metaTarget!, p, recv)

        if (val && val.__proto__ === Function.prototype)
            return new Proxy(val, {
                // If thisArg happens to be a proxified value, we will use the target object instead
                apply: (fn, thisArg, args) => Reflect.apply(fn, thisArg === recv ? metaTarget : thisArg, args),
            })

        return val
    },
    // Workaround to fix:
    // TypeError: getOwnPropertyDescriptor trap result is not configurable but target property '...' is configurable or non-existent
    getOwnPropertyDescriptor: (hint, p) => {
        const d = Reflect.getOwnPropertyDescriptor(hint, p)
        if (d && !Reflect.getOwnPropertyDescriptor(hint, p)) Object.defineProperty(hint, p, d)
        return d
    },
} as ProxyHandler<object>

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
export function proxify<T>(signal: () => T, options?: ProxifyOptions): T | undefined {
    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    const hint = (options?.hint === 'object' ? {} : function () {}) as any
    _proxifyMetadatas.set(hint, [signal, options?.cache ?? false])
    return new Proxy(hint, _proxifyHandler)
}

/**
 * Get the value of a proxified value at the current moment.
 * @param proxified The proxified value.
 * @returns The unproxified value.
 */
export function unproxify<T extends object>(proxified: T): T | undefined {
    const meta = _proxifyMetadatas.get(getProxyTarget(proxified)!)
    if (!meta) throw new TypeError(`${typeof proxified} is not a proxified value`)
    if (meta[1]) return meta[2] ?? ((meta[2] = meta[0]()) as any)
    return meta[0]() as any
}
