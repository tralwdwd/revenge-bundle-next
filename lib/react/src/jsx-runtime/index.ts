import { afterCallbacks, beforeCallbacks, insteadCallbacks } from './_internal'
import type { ComponentProps, ElementType, Key, ReactElement } from 'react'
import type { ReactJSXRuntime } from '..'

export type AnyJSXFactoryFunction = (typeof ReactJSXRuntime)['jsx' | 'jsxs']

export type BeforeJSXCallback<
    E extends ElementType = ElementType,
    P = ComponentProps<E>,
> = (
    args: [element: E, props: P, key?: Key | undefined],
) => Parameters<AnyJSXFactoryFunction>

export type InsteadJSXCallback<
    E extends ElementType = ElementType,
    P = ComponentProps<E>,
> = (
    args: [element: E, props: P, key?: Key | undefined],
) => ReturnType<AnyJSXFactoryFunction> | null

export type AfterJSXCallback = (
    tree: ReactElement,
) => ReturnType<AnyJSXFactoryFunction> | null

/**
 * Registers a hook to be called after a JSX element with the specified type is created.
 *
 * @param type The type of the element.
 * @param patch The hook.
 * @returns A function to unpatch.
 */
export function afterJSX(type: ElementType, patch: AfterJSXCallback) {
    let set = afterCallbacks.get(type)
    if (!set) {
        set = new Set()
        afterCallbacks.set(type, set)
    }

    set.add(patch as AfterJSXCallback)
    return () => set.delete(patch as AfterJSXCallback)
}

/**
 * Registers a hook to be called before a JSX element with the specified type is created.
 *
 * @param type The type of the element.
 * @param patch The hook.
 * @returns A function to unpatch.
 */
export function beforeJSX<
    E extends ElementType = ElementType,
    P = ComponentProps<E>,
>(type: E, patch: BeforeJSXCallback<E, P>) {
    let set = beforeCallbacks.get(type)
    if (!set) {
        set = new Set()
        beforeCallbacks.set(type, set)
    }

    set.add(patch as BeforeJSXCallback)
    return () => set.delete(patch as BeforeJSXCallback)
}

/**
 * Registers a callback to run instead when a JSX element with the specified type is created.
 *
 * @param type The type of the element.
 * @param patch The hook.
 * @returns A function to unpatch.
 */
export function insteadJSX<
    E extends ElementType = ElementType,
    P = ComponentProps<E>,
>(type: E, patch: InsteadJSXCallback<E, P>) {
    let set = insteadCallbacks.get(type)
    if (!set) {
        set = new Set()
        insteadCallbacks.set(type, set)
    }

    set.add(patch as InsteadJSXCallback)
    return () => set.delete(patch as InsteadJSXCallback)
}
