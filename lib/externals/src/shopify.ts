import { byDependencies, byProps, preferExports } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { proxify } from '@revenge-mod/utils/proxy'

import { ReactJsxRuntimeModuleId, ReactModuleId, ReactNativeModuleId } from '@revenge-mod/react'

export let FlashList: typeof import('@shopify/flash-list') = proxify(
    () => {
        const module = lookupModule(
            preferExports(
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

        if (module) return (FlashList = module)
    },
    {
        hint: 'object',
    },
)!
