import { getPluginDependencies, pMetadata } from '.'
import type {
    InitPluginApi,
    Plugin,
    PluginApi,
    PreInitPluginApi,
} from '../types'
import type { AnyPlugin, InternalPluginMeta } from '.'

export type PluginApiDecoratorStore<
    A extends PreInitPluginApi | InitPluginApi | PluginApi,
> = WeakMap<AnyPlugin, Parameters<A['decorate']>[0][]>

// Set of plugins that will always decorate the API of every other plugin.
export const pImplicitDeps = new Set<AnyPlugin>()

export const pDecoratorsPreInit: PluginApiDecoratorStore<PreInitPluginApi> =
    new WeakMap()

export const pDecoratorsInit: PluginApiDecoratorStore<InitPluginApi> =
    new WeakMap()

export const pDecoratorsStart: PluginApiDecoratorStore<PluginApi> =
    new WeakMap()

export function addPluginApiDecorator(
    store: PluginApiDecoratorStore<any>,
    plugin: AnyPlugin,
    decorator: Parameters<NonNullable<AnyPlugin['api']>['decorate']>[0],
) {
    let list = store.get(plugin)
    if (!list) {
        list = []
        store.set(plugin, list)
    }

    list.push(decorator)
}

export function decoratePluginApi(
    store: PluginApiDecoratorStore<
        PreInitPluginApi | InitPluginApi | PluginApi
    >,
    plugin: Plugin<any, any>,
    meta: InternalPluginMeta,
) {
    // Don't decorate implicit dependencies
    if (pImplicitDeps.has(plugin)) return

    // Decorate the plugin API with implicit dependencies
    // Implicit dependencies are internal plugin APIs, so we can run this without try-catch
    // If anything fails, everything else would fail anyway
    for (const dep of pImplicitDeps) {
        const decorators = store.get(dep)
        if (decorators)
            for (const decorator of decorators) decorator(plugin, meta.options)
    }

    const deps = getPluginDependencies(plugin)
    const { handleError: handleDependentError } = meta

    for (const dep of deps) {
        const decorators = store.get(dep)

        if (decorators) {
            const { handleError } = pMetadata.get(dep)!

            try {
                for (const decorator of decorators)
                    decorator(plugin, meta.options)
            } catch (e) {
                handleError(e)
                handleDependentError(e)
            }
        }
    }
}
