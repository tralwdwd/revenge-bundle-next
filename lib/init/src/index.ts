import './preinit'

import './patches/prevent-freeze'
import './patches/proxy'

import { onModuleFirstRequired, onModuleInitialized } from '@revenge-mod/modules/metro/subscriptions'
import { getErrorStack } from '@revenge-mod/utils/errors'

import { logger } from './shared'

onModuleFirstRequired(0, function onceIndexRequired() {
    runCatching(() => {
        if (__BUILD_FLAG_LOG_PROMISE_REJECTIONS__) require('./patches/log-promise-rejections')

        // Initialize preinit libraries
        require('@revenge-mod/modules/preinit')
        require('@revenge-mod/react/preinit')
        require('@revenge-mod/assets/preinit')
        require('@revenge-mod/discord/preinit')

        onModuleInitialized(0, function onceIndexInitialized() {
            runCatching(() => {
                // Register all plugins
                require('~plugins/all')

                // Initialize init libraries
                require('@revenge-mod/plugins/init')

                logger.log('Revenge loaded!')
            })
        })
    })
})

function runCatching(fn: () => void) {
    try {
        fn()
    } catch (e) {
        const { ClientInfoModule, DeviceModule } = require('@revenge-mod/discord/native') as
            // biome-ignore format: Don't format this please
            typeof import('@revenge-mod/discord/native')

        // TODO(init): Move to use native module
        alert(
            // biome-ignore lint/style/useTemplate: I want this to be readable, thank you
            `Failed to load Revenge (${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${__BUILD_ENV__}))\n` +
                `Discord: ${ClientInfoModule.Version} (${ClientInfoModule.Build})\n` +
                `Device: ${DeviceModule.deviceManufacturer} ${DeviceModule.deviceModel}\n\n` +
                getErrorStack(e),
        )
    }
}
