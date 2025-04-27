import './preinit'

import './patches/prevent-immutablize'
import './patches/proxy'

import { onModuleFirstRequired, onModuleInitialized } from '@revenge-mod/modules/metro/subscriptions'
import { getErrorStack } from '@revenge-mod/utils/errors'

import { logger } from './shared'

onModuleFirstRequired(0, function onceIndexModuleRequired() {
    if (!__BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__) require('./patches/log-promise-rejections')

    require('@revenge-mod/modules')

    onModuleInitialized(0, () => {
        require('@revenge-mod/assets')

        try {
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
})
