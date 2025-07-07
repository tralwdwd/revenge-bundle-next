export const _targets = new WeakMap<object, object>()

const OriginalProxy = globalThis.Proxy
globalThis.Proxy = new Proxy(OriginalProxy, {
    construct(_target, args) {
        const prox = new OriginalProxy(args[0], args[1])
        _targets.set(prox, args[0])
        return prox
    },
})
