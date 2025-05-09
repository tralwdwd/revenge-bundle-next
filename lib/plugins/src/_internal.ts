import { Logger } from '@revenge-mod/discord/common'

import { _uapi } from './apis'
import { PluginFlags as Flag, PluginStatus as Status } from './constants'

import type {
    InitPluginApi,
    Plugin,
    PluginApi,
    PluginCleanup,
    PluginFlags,
    PluginLifecycles,
    PluginManifest,
} from './types'

const _plugins = new Map<PluginManifest['id'], InternalPlugin>()
const _metas = new Map<
    PluginManifest['id'],
    [api: InitPluginApi | PluginApi, promises: Promise<void>[], iflags: InternalPluginFlags]
>()

export function registerPlugin(
    manifest: PluginManifest,
    lifecycles: PluginLifecycles,
    flags: PluginFlags,
    iflags: InternalPluginFlags,
) {
    // TODO(plugins): verify plugin manifest
    if (_plugins.has(manifest.id)) throw new Error(`Plugin with ID "${manifest.id}" already registered`)

    const plugin: InternalPlugin = {
        cleanups: [],
        errors: [],
        manifest,
        lifecycles,
        status: 0,
        flags,
        async disable() {
            // If plugin is not stopped, and is also not stopping, we need to stop it
            if (plugin.status && !(plugin.status & Status.Stopping)) await stopPlugin(plugin)

            plugin.flags &= ~Flag.Enabled
        },
    }

    _metas.set(manifest.id, [
        {
            cleanup: (...items) => {
                plugin.cleanups.push(...items)
            },
            get logger() {
                return (this.logger = new Logger(`Revenge > ${manifest.name}`))
            },
            plugin,
            unscoped: _uapi,
        },
        [],
        iflags,
    ])

    _plugins.set(manifest.id, plugin)
}

function handlePluginError(e: unknown, plugin: InternalPlugin) {
    plugin.errors.push(e)
    plugin.flags |= Flag.Errored
    if (plugin.flags & Flag.Enabled) return plugin.disable()
}

// function preparePluginStart(id: PluginManifest['id']) {
//     const api = _metas.get(id)?.[1]!
//     api.settings ??= ...
// }

export function enablePlugin(plugin: InternalPlugin) {
    // TODO(plugins): write to storage
    plugin.flags |= Flag.Enabled
}

export async function initPlugin(plugin: InternalPlugin) {
    const { manifest, lifecycles } = plugin
    const [api, promises] = _metas.get(manifest.id)!

    if (!(plugin.flags & Flag.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
    if (plugin.status & (Status.Initing | Status.Inited))
        throw new Error(`Plugin "${manifest.id}" is initializing or already initialized`)

    plugin.status |= Status.Initing

    try {
        const prom = lifecycles.init?.(api)
        promises.push(prom)
        await prom

        // plugin.disable() already handles, so it's the try block
        plugin.status |= Status.Inited
        plugin.status &= ~Status.Initing
    } catch (e) {
        await handlePluginError(e, plugin)
    }
}

export async function startPlugin(plugin: InternalPlugin) {
    const { manifest, lifecycles } = plugin
    const [api, promises] = _metas.get(manifest.id)!

    if (!(plugin.flags & Flag.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
    if (plugin.status & (Status.Starting | Status.Started))
        throw new Error(`Plugin "${manifest.id}" is starting or already started`)

    // Clear errors from previous runs
    plugin.errors = []
    plugin.status &= ~Flag.Errored

    plugin.status |= Status.Starting

    // preparePluginStart(manifest.id)

    try {
        const prom = lifecycles.start?.(api as PluginApi)
        promises.push(prom)
        await prom

        // disablePlugin() already handles cleaning up statuses, so it's in the try block
        plugin.status |= Status.Started
        plugin.status &= ~Status.Starting
    } catch (e) {
        await handlePluginError(e, plugin)
    }
}

async function stopPlugin(plugin: InternalPlugin) {
    const { manifest, lifecycles } = plugin
    const meta = _metas.get(manifest.id)!
    const [api, promises] = meta

    if (!(plugin.flags & Flag.Enabled)) throw new Error(`Plugin "${manifest.id}" is not enabled`)
    if (plugin.status & Status.Stopping) throw new Error(`Plugin "${manifest.id}" is stopping`)

    // If the plugin is initializing or starting, we need to wait for it to finish, then we'll stop it
    if (plugin.status & (Status.Initing | Status.Starting)) await Promise.all(promises)
    if (plugin.status & (Status.Inited | Status.Started))
        throw new Error(`Plugin "${manifest.id}" is not initialized started`)

    // In case the plugin only has init() and stop()
    // preparePluginStart(manifest.id)

    plugin.status |= Status.Stopping

    try {
        await lifecycles.stop?.(api as PluginApi)
    } catch (e) {
        await handlePluginError(e, plugin)
    } finally {
        // Run cleanups
        const results = await Promise.allSettled(plugin.cleanups.map(cleanup => cleanup()))
        for (const result of results)
            if (result.status === 'rejected') {
                await handlePluginError(result.reason, plugin)
                // Some cleanup was unsuccessful, so we need to reload the app
                plugin.flags |= Flag.ReloadRequired
            }

        // Clear unnecessary data
        meta[1] = []
        plugin.cleanups = []
        plugin.status = 0
    }
}

export function getEnabledPluginsCount() {
    let count = 0
    for (const plugin of _plugins.values()) if (plugin.flags & Flag.Enabled) count++
    return count
}

export async function initPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & Flag.Enabled) promises.push(initPlugin(plugin))
    // These Promises never throw, so it is fine
    await Promise.all(promises)
}

export async function startPlugins() {
    const promises: Promise<void>[] = []
    for (const plugin of _plugins.values()) if (plugin.flags & Flag.Enabled) promises.push(startPlugin(plugin))
    // These Promises never throw, so it is fine
    await Promise.all(promises)
}

export interface InternalPlugin extends Plugin {
    cleanups: PluginCleanup[]
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
