import './patches/prevent-immutablize'
import './patches/proxy'

import { getErrorStack } from '@revenge-mod/utils/errors'

import { logger } from './shared'

import type { Metro } from '@revenge-mod/modules'

let metroRequire: Metro.RequireFn | undefined = globalThis.__r
let metroDefine: Metro.DefineFn | undefined = globalThis.__d

Object.defineProperties(globalThis, {
    __r: {
        configurable: true,
        get: () => metroRequire,
        set: originalMetroRequire => {
            metroRequire = id =>
                id
                    ? // Early modules (React, React Native, polyfills, etc.) are required even before index (module 0) is required
                      originalMetroRequire(id)
                    : // Once module 0 is required, we initialize our patches
                      // We also revert __r to its original value, for performance reasons
                      // biome-ignore lint/performance/noDelete: This is faster than using Object.defineProperty
                      (delete globalThis.__r, (globalThis.__r = originalMetroRequire), onceIndexModuleRequired())
        },
    },
    __d: {
        configurable: true,
        // __d() is used to define a module
        // Before the first module is being defined, we clear the modules list (so we can get the module list instance)
        // We also revert __d to its original value, for performance reasons
        get: () => {
            // biome-ignore lint/performance/noDelete: This is faster than using Object.defineProperty
            delete globalThis.__d
            globalThis.__d = metroDefine

            modules = __c!()
            return metroDefine
        },
        set: v => {
            metroDefine = v
        },
    },
})

export let modules: Metro.ModuleList

function onceIndexModuleRequired() {
    if (!__BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__) require('./patches/log-promise-rejections')

    initialize().catch(e => {
        const { ClientInfoModule, DeviceModule } = require('@revenge-mod/modules/native')

        alert(
            [
                'Failed to load Revenge!',
                '',
                `Discord: ${ClientInfoModule.Version} (${ClientInfoModule.Build})`,
                `Device: ${DeviceModule.deviceManufacturer} ${DeviceModule.deviceModel}`,
                '',
                getErrorStack(e),
            ].join('\n'),
        )
    })
}

/*
    ! This function is blocking app startup !
    We need to make sure it's as fast as possible
*/
async function initialize() {
    logger.log('Revenge loaded!')
    __r(0)
}
