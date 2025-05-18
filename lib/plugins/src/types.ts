import type { PluginStatus, PluginFlags } from './constants'

import type { DiscordModules } from '@revenge-mod/discord/types'

import type { PluginApiDiscord } from './apis/discord'
import type { PluginApiExternals } from './apis/externals'
import type { PluginApiModules } from './apis/modules'
import type { PluginApiReact } from './apis/react'
import type { PluginApiPlugins } from './apis/plugins'

/**
 * The unscoped plugin API (very limited). This API is available as a global for plugins.
 * Available in the `preInit` phase.
 */
export interface UnscopedPreInitPluginApi {
    modules: PluginApiModules
    patcher: typeof import('@revenge-mod/patcher')
    plugins: PluginApiPlugins
    // utils: PluginApiUtils
}

/**
 * The unscoped plugin API (limited). This API is available as a global for plugins.
 * Available in the `init` phase.
 */
export interface UnscopedInitPluginApi extends UnscopedPreInitPluginApi {
    assets: typeof import('@revenge-mod/assets')
    discord: PluginApiDiscord
    externals: PluginApiExternals
    react: PluginApiReact
}

/**
 * The unscoped plugin API. This API is available as a global for plugins.
 * Available in the `start` and `stop` phase.
 */
export interface UnscopedPluginApi extends UnscopedInitPluginApi {
    // ui: typeof import('@revenge-mod/ui')
}

export type PluginCleanup = () => any
export type PluginCleanupApi = (...fns: PluginCleanup[]) => void

/**
 * The plugin API (very limited).
 * Available in the `preInit` phase.
 */
export interface PreInitPluginApi {
    unscoped: UnscopedPreInitPluginApi
    cleanup: PluginCleanupApi
    plugin: Plugin
}

/**
 * The plugin API (limited).
 * Available in the `init` phase.
 */
export interface InitPluginApi extends PreInitPluginApi {
    unscoped: UnscopedInitPluginApi
    logger: InstanceType<DiscordModules.Logger>
}

/**
 * The plugin API.
 * Available in the `start` and `stop` phase.
 */
export interface PluginApi extends InitPluginApi {
    // settings: typeof import('@revenge-mod/settings')
    unscoped: UnscopedPluginApi
}

// TODO(plugins): support plugin bundles
// export interface PluginBundle {
//     /**
//      * The unique identifier for the plugin bundle.
//      */
//     id: string
//     /**
//      * The author of the plugin bundle.
//      */
//     author: string
//     /**
//      * The URL of the plugin bundle.
//      */
//     url: string
// }

export interface PluginManifest {
    /**
     * The unique identifier for the plugin.
     */
    id: string
    /**
     * The name of the plugin.
     */
    name: string
    /**
     * The author of the plugin.
     */
    author: string
    /**
     * The description of the plugin.
     */
    description: string
    /**
     * The icon of the plugin.
     */
    icon?: string
}

export interface PluginLifecycles {
    /**
     * Runs as soon as possible with very limited APIs.
     * Before the index module (module 0)'s factory is run.
     *
     * @param api Plugin API (very limited).
     */
    preInit?: (api: PreInitPluginApi) => any
    /**
     * Runs as soon as all important modules are initialized.
     * After the index module (module 0)'s factory is run.
     *
     * @param api Plugin API (limited).
     */
    init?: (api: InitPluginApi) => any
    /**
     * Runs when the plugin can be started with all APIs available.
     *
     * @param api Plugin API.
     */
    start?: (api: PluginApi) => any
    /**
     * Runs when the plugin is stopped.
     *
     * @param api Plugin API.
     */
    stop?: (api: PluginApi) => any
}

export interface Plugin {
    // TODO(plugins): support plugin bundles
    // /**
    //  * The plugin bundle this plugin belongs to.
    //  */
    // bundle: PluginBundle
    /**
     * The plugin manifest.
     */
    manifest: PluginManifest
    /**
     * The plugin lifecycles.
     */
    lifecycles: PluginLifecycles

    /**
     * The plugin flags.
     * @see {@link PluginFlags}
     */
    flags: number
    /**
     * The plugin status.
     * @see {@link PluginStatus}
     */
    status: number
    /**
     * Errors encountered during the plugin lifecycles.
     */
    errors: unknown[]

    /**
     * Disable the plugin. This will also stop the plugin if it is running.
     */
    disable(): Promise<void>
    /**
     * Stop the plugin.
     */
    stop(): Promise<void>
}
