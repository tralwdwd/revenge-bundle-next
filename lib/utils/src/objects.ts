// Retain reference to original functions
import './functions'

// Heavily inspired by uwu/shelter
// https://github.com/uwu/shelter/blob/main/packages/shelter/src/exfiltrate.ts

const defineProperty = Object.defineProperty
// Patch to fix intercepting properties on Object.prototype
Object.defineProperty = (target, p, d) => {
    if (target === Object.prototype && _intercepting.has(p)) {
        _intercepting.set(p, d)
        return target
    }

    return defineProperty(target, p, d)
}

const _intercepting = new Map<PropertyKey, PropertyDescriptor | undefined>()

export type InterceptPropertyCallback = (target: any, value: any) => any

/**
 * Intercept a property when set on an object to modify its value. **Only one callback can be set for a property at a time.**
 *
 * @param prop The property to intercept.
 * @param callback The callback to call when the property is set, can return a non-null value to set the property to.
 * @returns The function to unintercept the property.
 */
export function interceptProperty(prop: PropertyKey, callback: (target: object, value: any) => any) {
    if (_intercepting.has(prop)) throw new Error(`Property ${String(prop)} is already being intercepted`)

    const proto = Object.prototype
    _intercepting.set(prop, Object.getOwnPropertyDescriptor(proto, prop))

    defineProperty(proto, prop, {
        configurable: true,
        set(value) {
            if (this === proto) {
                _intercepting.set(prop, { configurable: true, value })
                return
            }

            defineProperty(this, prop, {
                configurable: true,
                writable: true,
                enumerable: true,
                value: callback(this, value) ?? value,
            })
        },
        get() {
            const desc = _intercepting.get(prop)
            return desc && (desc.value ?? desc.get?.call(this))
        },
    })

    return () => {
        // @ts-expect-error
        delete proto[prop]
        const desc = _intercepting.get(prop)
        if (desc) defineProperty(proto, prop, desc)
        _intercepting.delete(prop)
    }
}
