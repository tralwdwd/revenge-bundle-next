import type { Metro } from '@revenge-mod/modules/types'

Object.defineProperty(globalThis, '__c', {
    configurable: true,
    set(clear: Metro.ClearFn) {
        Object.defineProperty(globalThis, '__c', {
            value: clear,
        })

        // Patch Metro's core functions
        require('@revenge-mod/modules/_/metro')

        require('./preinit')
    },
})
