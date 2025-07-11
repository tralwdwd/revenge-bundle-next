import { useEffect, useReducer } from 'react'
import { findInTree } from './trees'
import type { ReactNode } from 'react'
import type { SearchFilter } from './trees'

export function useIsFirstRender() {
    let firstRender = false

    useEffect(() => {
        firstRender = true
    }, [])

    return firstRender
}

export function useReRender() {
    const [, forceUpdate] = useReducer(x => ~x, 0)
    return forceUpdate
}

const ReactFiberWalkable = new Set(['props', 'children', 'child', 'sibling'])

export function findInReactFiber<F extends SearchFilter>(
    fiber: Extract<ReactNode, object>,
    filter: F,
) {
    return findInTree<F>(fiber, filter, {
        walkable: ReactFiberWalkable,
    })
}
