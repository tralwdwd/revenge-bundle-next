import type { Metro } from '@revenge-mod/modules/types'

Object.defineProperty(globalThis, '__c', {
    configurable: true,
    set(clear: Metro.ClearFn) {
        // @ts-expect-error
        // biome-ignore lint/performance/noDelete: We need to reset the property descriptor
        delete globalThis.__c
        globalThis.__c = clear

        const { patchMetroDefine } =
            require('@revenge-mod/modules/_/metro') as typeof import('@revenge-mod/modules/_/metro')

        patchMetroDefine()

        require('./preinit')
    },
})
