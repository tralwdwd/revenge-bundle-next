import { patchMetroDefine } from '@revenge-mod/modules/_/metro'

if (globalThis.__d) globalThis.__d = patchMetroDefine(globalThis.__d)
else
    Object.defineProperty(globalThis, '__d', {
        configurable: true,
        set: v => {
            // @ts-expect-error
            // biome-ignore lint/performance/noDelete: This is only done one time ever
            delete globalThis.__d
            globalThis.__d = patchMetroDefine(v)
        },
    })
