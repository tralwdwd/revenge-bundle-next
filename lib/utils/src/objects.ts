import type { AnyObject } from './types'

// Retain reference to original functions
export const objectFreeze = Object.freeze
export const objectDefineProperty = Object.defineProperty

// Patch to prevent the use of Object.freeze
Object.freeze = (o: any) => o

// Heavily inspired by uwu/shelter
// https://github.com/uwu/shelter/blob/main/packages/shelter/src/exfiltrate.ts

// Patch to fix intercepting properties on Object.prototype
Object.defineProperty = (target, p, d) => {
    if (target === Object.prototype && _intercepting.has(p)) {
        _intercepting.set(p, d)
        return target
    }

    return objectDefineProperty(target, p, d)
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
export function interceptProperty(
    prop: PropertyKey,
    callback: (target: object, value: any) => any,
) {
    if (_intercepting.has(prop))
        throw new Error(`Property ${String(prop)} is already being intercepted`)

    const proto = Object.prototype
    _intercepting.set(prop, Object.getOwnPropertyDescriptor(proto, prop))

    objectDefineProperty(proto, prop, {
        configurable: true,
        set(value) {
            if (this === proto) {
                _intercepting.set(prop, { configurable: true, value })
                return
            }

            objectDefineProperty(this, prop, {
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
        if (desc) objectDefineProperty(proto, prop, desc)
        _intercepting.delete(prop)
    }
}

/**
 * Simple check if to see if value is an object.
 *
 * @param val The value to check.
 */
export function isObject(val: any): val is AnyObject {
    return val && typeof val === 'object' && !Array.isArray(val)
}

/**
 * Deep merge two objects.
 *
 * @param target The object to merge into.
 * @param source The object to merge from.
 *
 * @returns The merged target.
 */
export function mergeDeep(target: AnyObject, source: AnyObject) {
    if (isObject(target) && isObject(source))
        for (const key in source)
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} })
                mergeDeep(target[key], source[key])
            } else Object.assign(target, { [key]: source[key] })

    return target
}

/**
 * Define a lazy property on an object that will be loaded when accessed.
 *
 * @param target The target object to define the property on.
 * @param property The property key to define.
 * @param loader The function that will be called to load the property value when accessed.
 */
export function defineLazyProperty<T extends object, K extends keyof T>(
    target: T,
    property: K,
    loader: () => T[K],
) {
    Object.defineProperty(target, property, {
        configurable: true,
        get() {
            delete target[property]
            return (target[property] = loader())
        },
    })
}
