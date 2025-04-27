import './preinit'

import './patches/prevent-immutablize'
import './patches/proxy'

import { onModuleFirstRequired, onModuleInitialized } from '@revenge-mod/modules/metro/subscriptions'
import { getErrorStack } from '@revenge-mod/utils/errors'

import { logger } from './shared'

onModuleFirstRequired(0, function onceIndexRequired() {
    if (!__BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__) require('./patches/log-promise-rejections')

    // Initialize preinit libraries
    require('@revenge-mod/modules/preinit')
})

onModuleInitialized(0, function onceIndexInitialized() {
    try {
        // Initialize init libraries
        require('@revenge-mod/assets/init')

        logger.log('Revenge loaded!')
    } catch (e) {
        const { ClientInfoModule, DeviceModule } = require('@revenge-mod/modules/native/discord') as
            // biome-ignore format: Don't format this please
            typeof import('@revenge-mod/modules/native/discord')

        // TODO(init): Move to use native module
        alert(
            // biome-ignore lint/style/useTemplate: I want this to be readable, thank you
            'Failed to load Revenge!\n' +
                `Discord: ${ClientInfoModule.Version} (${ClientInfoModule.Build})\n` +
                `Device: ${DeviceModule.deviceManufacturer} ${DeviceModule.deviceModel}\n\n` +
                getErrorStack(e),
        )
    }
})
