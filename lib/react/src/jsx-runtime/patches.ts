import { instead } from '@revenge-mod/patcher'
import { ReactJSXRuntime } from '..'
import { afterCallbacks, beforeCallbacks, insteadCallbacks } from './_internal'
import type { ElementType, ReactElement } from 'react'
import type { AnyJSXFactoryFunction } from '.'

const patch = (
    args: Parameters<AnyJSXFactoryFunction>,
    orig: AnyJSXFactoryFunction,
) => {
    const Comp = args[0] as any
    const type: ElementType = Comp.type ?? Comp

    const before = beforeCallbacks.get(type)
    if (before) for (const cb of before) args = cb(args)

    let tree: ReactElement | null | undefined
    const instead = insteadCallbacks.get(type)
    if (instead) for (const cb of instead) tree = cb(args)

    const after = afterCallbacks.get(type)
    if (after) for (const cb of after) tree = cb(tree!)

    if (tree !== undefined) return tree! // have to cast non-nullish even if returning null works

    return Reflect.apply(orig, ReactJSXRuntime, args)
}

instead(ReactJSXRuntime, 'jsx', patch)
instead(ReactJSXRuntime, 'jsxs', patch)
