import { byDependencies, byProps, every, preferExports, relativeDep } from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { ReactModuleId, ReactNativeModuleId } from '@revenge-mod/react'
import { destructure, proxify } from '@revenge-mod/utils/proxy'

let ClipboardModule: typeof import('@react-native-clipboard/clipboard') = proxify(
    () => {
        // ID: 4790

        // r6 = 4790;
        // r5 = [4791, 4792];

        // r6 = 4791;
        // r5 = [175, 4792];

        // r6 = 4792;
        // r5 = [27, 4793];

        const module = lookupModule(
            preferExports(
                byProps<typeof ClipboardModule>('useClipboard'),
                every(
                    byDependencies([relativeDep(1), relativeDep(2)]),
                    byDependencies([
                        [ReactModuleId, relativeDep(2, true)],
                        [ReactNativeModuleId, relativeDep(3, true)],
                    ]),
                ),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) return (ClipboardModule = module)
    },
    {
        hint: 'object',
    },
)!

export const { useClipboard } = destructure(ClipboardModule, { hint: 'function' })
export const { default: Clipboard } = destructure(ClipboardModule, { hint: 'object' })
