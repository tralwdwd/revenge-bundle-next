import { after, before } from '@revenge-mod/patcher'
import { ReactNative } from '..'
import type { RunApplicationCallback } from '../types'

export const sBeforeRunApplication = new Set<RunApplicationCallback>()
export const sAfterRunApplication = new Set<RunApplicationCallback>()

before(ReactNative.AppRegistry, 'runApplication', args => {
    for (const cb of sBeforeRunApplication)
        try {
            cb()
        } catch {}
    return args
})

after(ReactNative.AppRegistry, 'runApplication', res => {
    for (const cb of sAfterRunApplication)
        try {
            cb()
        } catch {}
    return res
})
