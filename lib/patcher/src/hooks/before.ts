import {
    createPatchedFunctionProxy,
    patchedFunctionProxyStates,
    unproxy,
    type HookNode,
    type PatchedFunctionProxyState,
} from '../internal'

function unpatchBefore<T extends UnknownFunction>(
    state: PatchedFunctionProxyState<PropertyKey, T>,
    hookNode: HookNode<BeforeHook<T>>,
) {
    if (hookNode.unpatched) return

    hookNode.unpatched = true
    hookNode.hook = undefined

    const { prev, next } = hookNode
    if (prev === undefined) {
        state.before = next
        if (next === undefined) {
            if (state.instead === undefined && state.after === undefined) unproxy(state)
            return
        }
    } else {
        prev.next = next
        hookNode.prev = undefined
        if (next === undefined) return
    }
    next.prev = prev
    hookNode.next = undefined
}

export function before<Parent extends Record<Key, UnknownFunction>, Key extends PropertyKey>(
    parent: Parent,
    key: FiniteDomain<Key>,
    hook: BeforeHook<Parent[Key]>,
): () => void
export function before<Key extends PropertyKey, Value extends UnknownFunction>(
    parent: Record<Key, Value>,
    key: FiniteDomain<Key>,
    hook: BeforeHook<Value>,
) {
    const target = parent[key]

    let state = patchedFunctionProxyStates.get(target)
    let hookNode: HookNode<typeof hook>
    if (state !== undefined && state.parent === parent && state.key === key) {
        const head = state.before
        hookNode = {
            unpatched: false,
            hook,
            prev: undefined,
            next: head,
        }
        if (head !== undefined) head.prev = hookNode
        state.before = hookNode
    } else {
        hookNode = {
            unpatched: false,
            hook,
            prev: undefined,
            next: undefined,
        }
        state = createPatchedFunctionProxy(target, parent, key, hookNode, undefined, undefined)
    }

    return unpatchBefore.bind(undefined, state, hookNode)
}
