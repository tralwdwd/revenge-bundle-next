import type { ElementType } from 'react'
import type { AfterJSXCallback, BeforeJSXCallback, InsteadJSXCallback } from '.'

export const beforeCallbacks = new Map<
    ElementType,
    Set<BeforeJSXCallback<any, any>>
>()
export const insteadCallbacks = new Map<
    ElementType,
    Set<InsteadJSXCallback<any, any>>
>()
export const afterCallbacks = new Map<ElementType, Set<AfterJSXCallback>>()
