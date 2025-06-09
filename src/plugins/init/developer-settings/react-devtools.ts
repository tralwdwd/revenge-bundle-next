import { ToastActionCreators } from '@revenge-mod/discord/actions'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'
import { getErrorStack } from '@revenge-mod/utils/errors'
import { useReRender } from '@revenge-mod/utils/react'
import { useEffect } from 'react'
import { api } from '.'

export const RDTContext: {
    ws: WebSocket | undefined
    addr: string
    con: boolean
    active: boolean
} = {
    active: Boolean(globalThis.__REACT_DEVTOOLS__),
    ws: undefined,
    addr: 'localhost:8097',
    con: false,
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

export function connect() {
    if (!RDTContext.active || RDTContext.ws) return

    const websocket = (RDTContext.ws = new WebSocket(`ws://${RDTContext.addr}`))

    websocket.addEventListener('open', () => {
        RDTContext.con = true
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
    RDTContext.con = false
    RDTContext.ws = undefined
}

export function disconnect() {
    if (RDTContext.ws) RDTContext.ws.close()
}

export function useIsConnected() {
    const rerender = useReRender()

    useEffect(() => {
        const sub: Subscription = e => (e === 1 || e === 2) && rerender()
        subscriptions.add(sub)

        return () => {
            subscriptions.delete(sub)
        }
    }, [rerender])

    return RDTContext.con
}
