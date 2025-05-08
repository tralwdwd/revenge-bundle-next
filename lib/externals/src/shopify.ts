import { byDependencies, byProps, moduleStateAware } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders'
import { proxify } from '@revenge-mod/utils/proxy'

import { ReactJsxRuntimeModuleId, ReactModuleId, ReactNativeModuleId } from '@revenge-mod/react'

export let FlashList: typeof import('@shopify/flash-list') = proxify(
    () => {
        const module = lookupModule(
            moduleStateAware(
                byProps<typeof FlashList>('FlashList'),
                // biome-ignore lint/suspicious/noSparseArray: don't care
                byDependencies([ReactModuleId, ReactNativeModuleId, ReactJsxRuntimeModuleId, , , , 2, ,]),
                // Dependencies. One in brackets are dynamic or late initialized.
                // [React, RN, JSXRuntime, (FlashListExports), (Reanimated), (RNBottomSheet), ImportTracker, (BottomSheetFlashList)]
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) {
            // This allows the Proxy instance to be garbage collected
            // after the module is initialized.
            FlashList = module
            gc()
            return module
        }
    },
    {
        hint: 'object',
    },
)!
