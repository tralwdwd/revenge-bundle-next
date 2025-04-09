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

// Heavily inspired by Wintry's lazy utils, but more optimized and stripped down, with a few fixes.
// https://github.com/pylixonly/wintry/blob/main/src/utils/lazy.ts

const _proxifyMetadatas = new WeakMap<object, [() => unknown, cacheable: boolean, cache?: unknown]>()

const _proxifyHandler = {
    ...Object.fromEntries(
        Object.getOwnPropertyNames(Reflect).map(k => [
            k,
            (hint: object, ...args: any[]) =>
                // @ts-expect-error
                Reflect[k](unproxifyFromHint(hint), ...args),
        ]),
    ),
    // Workaround to fix functions that the correct `this`
    get: (hint, p, recv) => {
        const target = unproxifyFromHint(hint)
        const val = Reflect.get(target!, p, recv)

        if (val && val.__proto__ === Function.prototype)
            return new Proxy(val, {
                // If thisArg happens to be a proxified value, we will use the target object instead
                apply: (fn, thisArg, args) => Reflect.apply(fn, thisArg === recv ? target : thisArg, args),
            })

        return val
    },
    // Workaround to fix:
    // TypeError: getOwnPropertyDescriptor trap result is not configurable but target property '...' is configurable or non-existent
    getOwnPropertyDescriptor: (hint, p) => {
        const d = Reflect.getOwnPropertyDescriptor(unproxifyFromHint(hint)!, p)
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
 *
 * @example Without cache
 * ```ts
 * const proxified = proxify(() => ({ value: Math.random() }), { hint: 'object' })
 * console.log(proxified) // { value: 0.123 }
 * console.log(proxified.value) // 0.456
 * console.log(proxified) // { value: 0.789 }
 * ```
 *
 * @example With cache
 * ```ts
 * const proxified = proxify(() => ({ value: Math.random() }), { hint: 'object', cache: true })
 * console.log(proxified) // { value: 0.123 }
 * console.log(proxified.value) // 0.123
 * console.log(proxified) // { value: 0.123 }
 * ```
 */
export function proxify<T>(signal: () => T, options?: ProxifyOptions): T {
    // biome-ignore lint/complexity/useArrowFunction: We need a function with a constructor
    const hint = (options?.hint === 'object' ? {} : function () {}) as any
    _proxifyMetadatas.set(hint, [signal, options?.cache ?? false])
    return new Proxy(hint, _proxifyHandler)
}

/**
 * Get the value of a proxified value at the current moment.
 *
 * @see {@link proxify} for more documentation.
 *
 * @param proxified The proxified value.
 * @returns The unproxified value.
 *
 * @throws {TypeError} If the value is not a proxified value.
 *
 * @example Without cache
 * ```ts
 * const proxified = proxify(() => ({ value: Math.random() }), { hint: 'object' })
 * const x = unproxify(proxified)
 * console.log(x) // { value: 0.123 }
 * console.log(x.value) // 0.123
 * console.log(proxified) // { value: 0.456 }
 * ```
 *
 * @example With cache
 * ```ts
 * const proxified = proxify(() => ({ value: Math.random() }), { hint: 'object', cache: true })
 * const x = unproxify(proxified)
 * console.log(x) // { value: 0.123 }
 * console.log(x.value) // 0.123
 * console.log(proxified) // { value: 0.123 }
 * ```
 */
export function unproxify<T extends object>(proxified: T): T {
    const hint = getProxyTarget(proxified)
    if (!hint) throw new TypeError(`${typeof proxified} is not a proxified value`)
    return unproxifyFromHint(hint)
}

function unproxifyFromHint(hint: object) {
    const meta = _proxifyMetadatas.get(hint)!
    if (meta[1]) return meta[2] ?? ((meta[2] = meta[0]()) as any)
    return meta[0]() as any
}

/**
 * Destructure a proxified value.
 * @param proxified The proxified value.
 * @param options The options to use for the destructured value.
 *
 * @see {@link proxify} for more documentation.
 *
 * @throws {TypeError} If the value is not a proxifiable value (primitives).
 *
 * @example
 * ```ts
 * // cache is not turned on, so each access will call the signal again
 * const { x, y } = destructure(
 *   proxify(() => ({ x: Math.random(), y: [Math.random()], z: null })),
 *   { hint: 'object' }
 * )
 *
 * // Non-nullish primitives can be proxified, but you'll need to access their values with valueOf()
 * x.valueOf() === x.valueOf() // false
 *
 * y // [0.123]
 * y // [0.456]
 *
 * z // TypeError: Cannot destructure and proxify null (reading 'z')
 * ```
 */
export function destructure<T extends object>(proxified: T, options?: ProxifyOptions): T {
    return new Proxy({} as T, {
        get: (_, p) =>
            proxify(() => {
                // @ts-expect-error
                const v = unproxify(proxified)[p]

                if (v == null) throw new TypeError(`Cannot destructure and proxify ${v} (reading '${String(p)}')`)
                if (typeof v === 'function' || typeof v === 'object') return v
                // Forcefully proxify primitives
                return Object(v)
            }, options),
    })
}
