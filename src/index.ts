// Note that both Object.freeze and Proxy patches are implicitly run by requiring the two libraries below.
import { patchMetroDefine } from '@revenge-mod/modules/_/metro'
import { interceptProperty } from '@revenge-mod/utils/objects'

// By doing this, we are assuming __METRO_GLOBAL_PREFIX__ is an empty string and globalThis.__d isn't already set.
// But both should be true either way.
const unintercept = interceptProperty('__d', (_, mDefine) => {
    unintercept()
    return patchMetroDefine(mDefine)
})

import {
    onModuleFirstRequired,
    onModuleInitialized,
} from '@revenge-mod/modules/metro/subscriptions'
import { getErrorStack } from '@revenge-mod/utils/errors'

const IndexModuleId = 0

onModuleFirstRequired(IndexModuleId, function onIndexRequired() {
    try {
        if (__BUILD_FLAG_LOG_PROMISE_REJECTIONS__)
            require('./patches/log-promise-rejections')

        // Initialize preinit libraries
        require('@revenge-mod/modules/preinit')
        require('@revenge-mod/react/preinit')
        require('@revenge-mod/assets/preinit')
        require('@revenge-mod/storage/preinit')
        require('@revenge-mod/discord/preinit')

        // Run all preinit plugins
        require('~/plugins/preinit')
        require('@revenge-mod/plugins/preinit')

        onModuleInitialized(IndexModuleId, function onIndexInitialized() {
            try {
                // Initialize init libraries
                require('@revenge-mod/storage/init')
                require('@revenge-mod/externals/init')
                require('@revenge-mod/discord/init')
                require('@revenge-mod/components/init')

                // Run all init plugins
                require('~/plugins/init')
                require('@revenge-mod/plugins/init')
            } catch (e) {
                onError(e)
            }
        })
    } catch (e) {
        onError(e)
    }
})

function onError(e: unknown) {
    // TODO(init): Move to use native provided alert function, which will accept a string stack trace
    // Above will reduce the need for runCatching() to exist, as the code won't be able to be deduped any further
    const { ClientInfoModule, DeviceModule } =
        require('@revenge-mod/discord/native') as typeof import('@revenge-mod/discord/native')

    const Client = ClientInfoModule.getConstants()
    const Device = DeviceModule.getConstants()

    alert(
        `Failed to load Revenge (${__BUILD_VERSION__}-${__BUILD_COMMIT__}-${__BUILD_BRANCH__} (${__BUILD_ENV__}))\n` +
            `Discord: ${Client.Version} (${Client.Build})\n` +
            `Device: ${Device.deviceManufacturer} ${Device.deviceModel}\n\n` +
            getErrorStack(e),
    )
}
