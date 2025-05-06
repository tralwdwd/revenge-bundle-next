import * as DiscordLibrary from '@revenge-mod/discord'
import * as ModulesLibrary from '@revenge-mod/modules'
import * as PatcherLibrary from '@revenge-mod/patcher'
import * as PluginsLibrary from '@revenge-mod/plugins'
import * as ReactLibrary from '@revenge-mod/react'
import * as UtilsLibrary from '@revenge-mod/utils'

const { PluginFlags, PluginStatus } = PluginsLibrary

export const _uapi: PluginsLibrary.UnscopedInitPluginApi | PluginsLibrary.UnscopedPluginApi = {
    discord: DiscordLibrary,
    modules: ModulesLibrary,
    patcher: PatcherLibrary,
    plugins: PluginsLibrary,
    react: ReactLibrary,
    utils: UtilsLibrary,
}

const _plugins = new Map<PluginsLibrary.PluginManifest['id'], InternalPlugin>()
const _pluginIFlags = new Map<PluginsLibrary.PluginManifest['id'], InternalPluginFlags>()

export function registerPlugin(
    manifest: PluginsLibrary.PluginManifest,
    lifecycles: PluginsLibrary.PluginLifecycles,
    flags: PluginsLibrary.PluginFlags,
    iFlags: InternalPluginFlags,
) {
    // TODO(plugins): verify plugin manifest
    if (_plugins.has(manifest.id)) throw new Error(`Plugin with ID "${manifest.id}" already registered`)

    _pluginIFlags.set(manifest.id, iFlags)

    const handleError = (e: unknown) => {
        plugin.errors.push(e)
        plugin.flags |= PluginFlags.Errored
        if (plugin.flags & PluginFlags.Enabled) return plugin.disable()
    }

    const plugin: InternalPlugin = {
        promises: [],
        cleanups: [],
        errors: [],
        manifest,
        lifecycles,
        status: 0,
        flags,
        prepareStart: () => {
            // const sapi = api as PluginsLibrary.PluginApi
            // sapi.settings ??= ...
        },
        async init() {
            if (!(plugin.flags & PluginFlags.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
            if (plugin.status & (PluginStatus.Initing | PluginStatus.Inited))
                throw new Error(`Plugin "${manifest.id}" is initializing or already initialized`)

            plugin.status |= PluginStatus.Initing

            try {
                const prom = lifecycles.init?.(api)
                plugin.promises.push(prom)
                await prom

                // plugin.disable() already handles, so it's the try block
                plugin.status |= PluginStatus.Inited
                plugin.status &= ~PluginStatus.Initing
            } catch (e) {
                await handleError(e)
            }
        },
        async start() {
            if (!(plugin.flags & PluginFlags.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
            if (plugin.status & (PluginStatus.Starting | PluginStatus.Started))
                throw new Error(`Plugin "${manifest.id}" is starting or already started`)

            // Clear errors from previous runs
            plugin.errors = []
            plugin.status &= ~PluginFlags.Errored

            plugin.status |= PluginStatus.Starting

            plugin.prepareStart()

            try {
                const prom = lifecycles.start?.(api as PluginsLibrary.PluginApi)
                plugin.promises.push(prom)
                await prom

                // plugin.disable() already handles, so it's in the try block
                plugin.status |= PluginStatus.Started
                plugin.status &= ~PluginStatus.Starting
            } catch (e) {
                await handleError(e)
            }
        },
        async stop() {
            if (!(plugin.flags & PluginFlags.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)

            if (plugin.status & PluginStatus.Stopping) throw new Error(`Plugin "${manifest.id}" is stopping`)

            // If the plugin is initializing or starting, we need to wait for it to finish, then we'll stop it
            if (plugin.status & (PluginStatus.Initing | PluginStatus.Starting)) await Promise.all(plugin.promises)

            if (plugin.status & (PluginStatus.Inited | PluginStatus.Started))
                throw new Error(`Plugin "${manifest.id}" is not initialized started`)

            // In case the plugin only has init() and stop()
            plugin.prepareStart()

            plugin.status |= PluginStatus.Stopping

            try {
                await lifecycles.stop?.(api as PluginsLibrary.PluginApi)
            } catch (e) {
                await handleError(e)
            } finally {
                // Run cleanups
                const results = await Promise.allSettled(plugin.cleanups.map(cleanup => cleanup()))
                for (const result of results)
                    if (result.status === 'rejected') {
                        await handleError(result.reason)
                        // Some cleanup was unsuccessful, so we need to reload the app
                        plugin.flags |= PluginFlags.ReloadRequired
                    }

                // Clear unnecessary data
                plugin.promises = []
                plugin.cleanups = []
                plugin.status = 0

                // Call garbage collector to free up memory
                gc()
                gc()
            }
        },
        async enable() {
            plugin.flags |= PluginFlags.Enabled
        },
        async disable() {
            plugin.flags &= ~PluginFlags.Enabled

            // If plugin is not stopped, and is also not stopping, we need to stop it
            if (plugin.status && !(plugin.status & PluginStatus.Stopping)) await plugin.stop()
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

export function getEnabledPluginsCount() {
    let count = 0
    for (const plugin of _plugins.values()) if (plugin.flags & PluginFlags.Enabled) count++
    return count
}

export async function initPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & PluginFlags.Enabled) promises.push(plugin.init())
    // These Promises never throw, so it is fine
    await Promise.all(promises)
}

export async function startPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & PluginFlags.Enabled) promises.push(plugin.start())
    // These Promises never throw, so it is fine
    await Promise.all(promises)
}

export interface InternalPlugin extends PluginsLibrary.Plugin {
    promises: Promise<void>[]
    cleanups: PluginsLibrary.PluginCleanup[]
    prepareStart(): void
    init(): Promise<void>
    start(): Promise<void>
    stop(): Promise<void>
}

export const InternalPluginFlags = {
    /**
     * Marks the plugin as internal.
     */
    Internal: 1 << 0,
    /**
     * Marks the plugin as essential. This means it should not be removed, disabled, or stopped by normal means.
     */
    Essential: 1 << 1,
}

export type InternalPluginFlags = (typeof InternalPluginFlags)[keyof typeof InternalPluginFlags]
