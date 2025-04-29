import * as DiscordLibrary from '@revenge-mod/discord'
import * as ModulesLibrary from '@revenge-mod/modules'
import * as PatcherLibrary from '@revenge-mod/patcher'
import * as PluginsLibrary from '@revenge-mod/plugins'
import * as ReactLibrary from '@revenge-mod/react'

const { PluginFlags } = PluginsLibrary

export const _uapi: PluginsLibrary.UnscopedInitPluginApi | PluginsLibrary.UnscopedPluginApi = {
    discord: DiscordLibrary,
    modules: ModulesLibrary,
    plugins: PluginsLibrary,
    react: ReactLibrary,
    patcher: PatcherLibrary,
    // utils: UtilsLibrary,
}

const _plugins = new Map<PluginsLibrary.PluginManifest['id'], InternalPlugin>()

export function registerPlugin(
    manifest: PluginsLibrary.PluginManifest,
    lifecycles: PluginsLibrary.PluginLifecycles,
    flags: PluginsLibrary.PluginFlags = 0,
) {
    // TODO(plugins): verify plugin manifest
    if (_plugins.has(manifest.id)) throw new Error(`Plugin with ID "${manifest.id}" already registered`)

    const handleError = (e: unknown) => {
        plugin.errors.push(e)
        plugin.flags |= PluginFlags.Errored
        return plugin.disable()
    }

    const plugin: InternalPlugin = {
        cleanups: [],
        errors: [],
        manifest,
        lifecycles,
        flags,
        prepareStart: () => {
            // const sapi = api as PluginsLibrary.PluginApi
            // sapi.settings ??= ...
        },
        init: async () => {
            plugin.flags |= PluginFlags.StatusInit
            plugin.flags |= PluginFlags.StatusActioning

            try {
                await lifecycles.init?.(api)
            } catch (e) {
                handleError(e)
            }

            // Not in finally block because plugin.disable() already handles
            plugin.flags &= ~PluginFlags.StatusInit
            plugin.flags &= ~PluginFlags.StatusActioning
        },
        start: async () => {
            plugin.flags |= PluginFlags.StatusStart
            plugin.flags |= PluginFlags.StatusActioning

            plugin.prepareStart()

            try {
                await lifecycles.start?.(api as PluginsLibrary.PluginApi)
            } catch (e) {
                handleError(e)
            }

            // Not in finally block because plugin.disable() already handles
            plugin.flags &= ~PluginFlags.StatusStart
            plugin.flags &= ~PluginFlags.StatusActioning
        },
        stop: async () => {
            plugin.flags &= ~PluginFlags.StatusInit
            plugin.flags &= ~PluginFlags.StatusStart
            plugin.flags |= PluginFlags.StatusActioning

            // In case the plugin only has init() and stop()
            plugin.prepareStart()

            try {
                await lifecycles.stop?.(api as PluginsLibrary.PluginApi)
            } catch (e) {
                handleError(e)
            } finally {
                // Run cleanups
                const results = await Promise.allSettled(plugin.cleanups.map(cleanup => cleanup()))
                for (const result of results) if (result.status === 'rejected') plugin.errors.push(result.reason)

                plugin.flags &= ~PluginFlags.StatusActioning
            }
        },
        enable: async () => {
            plugin.flags |= PluginFlags.Enabled
            if (lifecycles.init) plugin.flags |= PluginFlags.ReloadRequired
        },
        disable: async () => {
            plugin.flags &= ~PluginFlags.Enabled
            // If plugin is initialized/started, we need to stop it
            if (plugin.flags & (PluginFlags.StatusInit | PluginFlags.StatusStart)) await plugin.stop()
        },
    }

    const api: PluginsLibrary.InitPluginApi | PluginsLibrary.PluginApi = {
        cleanup: (...items) => {
            plugin.cleanups.push(...items)
        },
        logger: new DiscordLibrary.Logger(`Revenge > ${plugin.manifest.name}`),
        plugin,
        unscoped: _uapi,
    }!

    _plugins.set(manifest.id, plugin)
}

export function initPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & PluginFlags.Enabled) promises.push(plugin.init())
    // These Promises never throw, so it is fine
    return Promise.all(promises)
}

export function startPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & PluginFlags.Enabled) promises.push(plugin.start())
    // These Promises never throw, so it is fine
    return Promise.all(promises)
}

export interface InternalPlugin extends PluginsLibrary.Plugin {
    cleanups: PluginsLibrary.PluginCleanup[]
    prepareStart(): void
    init(): Promise<void>
    start(): Promise<void>
    stop(): Promise<void>
}
