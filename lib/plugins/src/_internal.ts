import * as DiscordLibrary from '@revenge-mod/discord'
import * as ModulesLibrary from '@revenge-mod/modules'
import * as PatcherLibrary from '@revenge-mod/patcher'
import * as PluginsLibrary from '@revenge-mod/plugins'
import * as ReactLibrary from '@revenge-mod/react'
import * as UtilsLibrary from '@revenge-mod/utils'

import type {
    InitPluginApi,
    Plugin,
    PluginApi,
    PluginCleanup,
    PluginFlags,
    PluginLifecycles,
    PluginManifest,
    UnscopedInitPluginApi,
    UnscopedPluginApi,
} from '../types'

const { PluginFlags: Flag, PluginStatus: Status } = PluginsLibrary

export const _uapi: UnscopedInitPluginApi | UnscopedPluginApi = {
    discord: DiscordLibrary,
    modules: ModulesLibrary,
    patcher: PatcherLibrary,
    plugins: PluginsLibrary,
    react: ReactLibrary,
    utils: UtilsLibrary,
}

const _plugins = new Map<PluginManifest['id'], InternalPlugin>()
const _pluginIFlags = new Map<PluginManifest['id'], InternalPluginFlags>()

export function registerPlugin(
    manifest: PluginManifest,
    lifecycles: PluginLifecycles,
    flags: PluginFlags,
    iFlags: InternalPluginFlags,
) {
    // TODO(plugins): verify plugin manifest
    if (_plugins.has(manifest.id)) throw new Error(`Plugin with ID "${manifest.id}" already registered`)

    _pluginIFlags.set(manifest.id, iFlags)

    const handleError = (e: unknown) => {
        plugin.errors.push(e)
        plugin.flags |= Flag.Errored
        if (plugin.flags & Flag.Enabled) return plugin.disable()
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
            // const sapi = api as PluginApi
            // sapi.settings ??= ...
        },
        async init() {
            if (!(plugin.flags & Flag.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
            if (plugin.status & (Status.Initing | Status.Inited))
                throw new Error(`Plugin "${manifest.id}" is initializing or already initialized`)

            plugin.status |= Status.Initing

            try {
                const prom = lifecycles.init?.(api)
                plugin.promises.push(prom)
                await prom

                // plugin.disable() already handles, so it's the try block
                plugin.status |= Status.Inited
                plugin.status &= ~Status.Initing
            } catch (e) {
                await handleError(e)
            }
        },
        async start() {
            if (!(plugin.flags & Flag.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
            if (plugin.status & (Status.Starting | Status.Started))
                throw new Error(`Plugin "${manifest.id}" is starting or already started`)

            // Clear errors from previous runs
            plugin.errors = []
            plugin.status &= ~Flag.Errored

            plugin.status |= Status.Starting

            plugin.prepareStart()

            try {
                const prom = lifecycles.start?.(api as PluginApi)
                plugin.promises.push(prom)
                await prom

                // plugin.disable() already handles, so it's in the try block
                plugin.status |= Status.Started
                plugin.status &= ~Status.Starting
            } catch (e) {
                await handleError(e)
            }
        },
        async stop() {
            if (!(plugin.flags & Flag.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)

            if (plugin.status & Status.Stopping) throw new Error(`Plugin "${manifest.id}" is stopping`)

            // If the plugin is initializing or starting, we need to wait for it to finish, then we'll stop it
            if (plugin.status & (Status.Initing | Status.Starting)) await Promise.all(plugin.promises)

            if (plugin.status & (Status.Inited | Status.Started))
                throw new Error(`Plugin "${manifest.id}" is not initialized started`)

            // In case the plugin only has init() and stop()
            plugin.prepareStart()

            plugin.status |= Status.Stopping

            try {
                await lifecycles.stop?.(api as PluginApi)
            } catch (e) {
                await handleError(e)
            } finally {
                // Run cleanups
                const results = await Promise.allSettled(plugin.cleanups.map(cleanup => cleanup()))
                for (const result of results)
                    if (result.status === 'rejected') {
                        await handleError(result.reason)
                        // Some cleanup was unsuccessful, so we need to reload the app
                        plugin.flags |= Flag.ReloadRequired
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
            plugin.flags |= Flag.Enabled
        },
        async disable() {
            plugin.flags &= ~Flag.Enabled

            // If plugin is not stopped, and is also not stopping, we need to stop it
            if (plugin.status && !(plugin.status & Status.Stopping)) await plugin.stop()
        },
    }

    let logger: InstanceType<typeof DiscordLibrary.common.Logger>

    const api: InitPluginApi | PluginApi = {
        cleanup: (...items) => {
            plugin.cleanups.push(...items)
        },
        get logger() {
            return (logger ??= new DiscordLibrary.common.Logger(`Revenge > ${manifest.name}`))
        },
        plugin,
        unscoped: _uapi,
    }!

    _plugins.set(manifest.id, plugin)
}

export function getEnabledPluginsCount() {
    let count = 0
    for (const plugin of _plugins.values()) if (plugin.flags & Flag.Enabled) count++
    return count
}

export async function initPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & Flag.Enabled) promises.push(plugin.init())
    // These Promises never throw, so it is fine
    await Promise.all(promises)
}

export async function startPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & Flag.Enabled) promises.push(plugin.start())
    // These Promises never throw, so it is fine
    await Promise.all(promises)
}

export interface InternalPlugin extends Plugin {
    promises: Promise<void>[]
    cleanups: PluginCleanup[]
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
