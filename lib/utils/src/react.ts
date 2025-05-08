import { React } from '@revenge-mod/react'

import { type SearchFilter, findInTree } from './trees'

import type { ReactNode } from 'react'

export function useIsFirstRender() {
    let firstRender = false

    React.useEffect(() => {
        firstRender = true
    }, [])

    return firstRender
}

export function useReRender() {
    const [, forceUpdate] = React.useReducer(x => ~x, 0)
    return forceUpdate
}

const ReactFiberWalkable = new Set(['props', 'children', 'child', 'sibling'])

export function findInReactFiber(tree: Extract<ReactNode, { props: unknown }>, filter: SearchFilter): any {
    return findInTree(tree, filter, {
        walkable: ReactFiberWalkable,
    })
}
