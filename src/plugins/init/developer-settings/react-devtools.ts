import { ToastActionCreators } from '@revenge-mod/discord/actions'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'
import { getErrorStack } from '@revenge-mod/utils/errors'
import { useReRender } from '@revenge-mod/utils/react'
import { useEffect } from 'react'
import { api } from '.'

export const DevToolsContext: {
    ws: WebSocket | undefined
    address: string
    open: boolean
    available: boolean
} = {
    available: Boolean(globalThis.__REACT_DEVTOOLS__),
    ws: undefined,
    address: 'localhost:8097',
    open: false,
}

type Subscription = (event: 1 | 2 | 3, err?: unknown) => void
const subscriptions: Set<Subscription> = new Set()

const CircleXIcon = lookupGeneratedIconComponent(
    'CircleXIcon',
    'CircleXIcon-secondary',
    'CircleXIcon-primary',
)

subscriptions.add((e, err) => {
    if (e === 3) {
        const actualError =
            (err as { message: string }).message ?? getErrorStack(err)

        api.logger.error('React DevTools error:', actualError)

        ToastActionCreators.open({
            key: 'REACT_DEVTOOLS_ERROR',
            IconComponent: CircleXIcon,
            content: actualError,
        })
    }
})

export function connectToDevTools() {
    if (!DevToolsContext.available || DevToolsContext.ws) return

    const websocket = (DevToolsContext.ws = new WebSocket(
        `ws://${DevToolsContext.address}`,
    ))

    websocket.addEventListener('open', () => {
        DevToolsContext.open = true
        for (const sub of subscriptions) sub(1)
    })

    websocket.addEventListener('close', () => {
        cleanup()
        for (const sub of subscriptions) sub(2)
    })

    websocket.addEventListener('error', e => {
        cleanup()
        for (const sub of subscriptions) sub(3, e)
    })

    __REACT_DEVTOOLS__!.exports.connectToDevTools({
        websocket,
    })
}

function cleanup() {
    DevToolsContext.open = false
    DevToolsContext.ws = undefined
}

export function disconnectFromDevTools() {
    if (DevToolsContext.ws) DevToolsContext.ws.close()
}

export function useIsDevToolsOpen() {
    const rerender = useReRender()

    useEffect(() => {
        const sub: Subscription = e => (e === 1 || e === 2) && rerender()
        subscriptions.add(sub)

        return () => {
            subscriptions.delete(sub)
        }
    }, [rerender])

    return DevToolsContext.open
}
