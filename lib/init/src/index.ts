import './preinit'

import './patches/prevent-immutablize'
import './patches/proxy'

import { onModuleInitialized } from '@revenge-mod/modules/metro/subscriptions'
import { getErrorStack } from '@revenge-mod/utils/errors'

import { logger } from './shared'

onModuleInitialized(0, async function onceIndexModuleRequired() {
    if (!__BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__) require('./patches/log-promise-rejections')

    try {
        logger.log('Revenge loaded!')
    } catch (e) {
        const { ClientInfoModule, DeviceModule } = require('@revenge-mod/modules/native') satisfies
            // biome-ignore format: Don't format this please
            typeof import('@revenge-mod/modules/native')

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
