import { after as _after } from './hooks/after'
import { before as _before } from './hooks/before'
import { instead as _instead } from './hooks/instead'

export * from './hooks/after'
export * from './hooks/before'
export * from './hooks/instead'

/**
 * Creates a new instance of the patcher.
 * @see {PatcherInstance}
 */
export function createPatcherInstance(): PatcherInstance {
    const up: Array<() => void> = []

    return {
        after: (p, k, h) => {
            const u = _after(p, k, h)
            up.push(u)
            return u
        },
        before: (p, k, h) => {
            const u = _before(p, k, h)
            up.push(u)
            return u
        },
        instead: (p, k, h) => {
            const u = _instead(p, k, h)
            up.push(u)
            return u
        },
        unpatchAll: () => {
            for (const u of up) u()
            up.length = 0
        },
    }
}

/**
 * An instance of the patcher that allows reverting all patches on command.
 */
export interface PatcherInstance {
    after: typeof _after
    before: typeof _before
    instead: typeof _instead
    unpatchAll: () => void
}
