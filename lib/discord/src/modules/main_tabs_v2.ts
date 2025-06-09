import {
    byDependencies,
    byProps,
    every,
    looseDeps,
    preferExports,
    relativeDep,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { proxify } from '@revenge-mod/utils/proxy'
import type { NavigationContainerRef } from '@react-navigation/core'

export interface RootNavigationRef {
    getRootNavigationRef<
        T extends object = Record<string, unknown>,
    >(): NavigationContainerRef<T>
}

export let RootNavigationRef: RootNavigationRef = proxify(
    () => {
        const [module] = lookupModule(
            preferExports(
                byProps<RootNavigationRef>('getRootNavigationRef'),
                every(
                    byDependencies([
                        looseDeps([
                            [],
                            looseDeps([relativeDep(1), relativeDep(2)]),
                        ]),
                        2,
                    ]),
                ),
            ),
            {
                includeUninitialized: true,
            },
        )

        if (module) return (RootNavigationRef = module)
    },
    {
        hint: 'object',
    },
)!
