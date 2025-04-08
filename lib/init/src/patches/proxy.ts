/**
 * This patch allows us to store instances of Proxy, so we can check whether a value is created using Proxy or not.
 * This is especially useful for blacklisting discord-intl modules exports, and exports that cannot be patched.
 */

export const _targets = new WeakMap<object, object>()

const OriginalProxy = globalThis.Proxy
globalThis.Proxy = new Proxy(OriginalProxy, {
    construct(_target, args) {
        const prox = new OriginalProxy(args[0], args[1])
        _targets.set(prox, args[0])
        return prox
    },
})
