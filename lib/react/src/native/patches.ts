import { after, before } from '@revenge-mod/patcher'
import { ReactNative } from '..'

import { waitForModules } from '@revenge-mod/modules/finders/wait'
import { byProps } from '@revenge-mod/modules/finders/filters'

import type { RunApplicationCallback } from '.'

export const _bra = new Set<RunApplicationCallback>()
export const _ara = new Set<RunApplicationCallback>()

const unsub = waitForModules(byProps('AppRegistry'), () => {
    unsub()

    before(ReactNative.AppRegistry, 'runApplication', args => {
        for (const cb of _bra) cb()
        return args
    })

    after(ReactNative.AppRegistry, 'runApplication', res => {
        for (const cb of _ara) cb()
        return res
    })
})
