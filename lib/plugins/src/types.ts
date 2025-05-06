import type { DiscordModules } from '@revenge-mod/discord/types'

import type { PluginFlags, PluginStatus } from './constants'

/**
 * The unscoped plugin API (limited). This API is available as a global for plugins.
 * Available in the `init` phase.
 */
export interface UnscopedInitPluginApi {
    discord: typeof import('@revenge-mod/discord')
    plugins: typeof import('@revenge-mod/plugins')
    modules: typeof import('@revenge-mod/modules')
    patcher: typeof import('@revenge-mod/patcher')
    react: typeof import('@revenge-mod/react')
    utils: typeof import('@revenge-mod/utils')
}

/**
 * The unscoped plugin API. This API is available as a global for plugins.
 * Available in the `start` and `stop` phase.
 */
export interface UnscopedPluginApi extends UnscopedInitPluginApi {
    assets: typeof import('@revenge-mod/assets')
    // ui: typeof import('@revenge-mod/ui')
    // utils: typeof import('@revenge-mod/utils')
}

export type PluginCleanup = () => any
export type PluginCleanupApi = (...fns: PluginCleanup[]) => void

/**
 * The plugin API (limited).
 * Available in the `init` phase.
 */
export interface InitPluginApi {
    plugin: Plugin
    logger: InstanceType<DiscordModules.Logger>
    unscoped: UnscopedInitPluginApi
    cleanup: PluginCleanupApi
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
     * Runs immediately as soon as possible with limited APIs.
     *
     * @param api Plugin API (limited).
     * @param context Plugin context.
     */
    init?: (api: InitPluginApi) => any
    /**
     * Runs when the plugin can be started with all APIs available.
     *
     * @param api Plugin API.
     * @param context Plugin context.
     */
    start?: (api: PluginApi) => any
    /**
     * Runs when the plugin is stopped.
     *
     * @param api Plugin API.
     * @param context Plugin context.
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
     */
    flags: PluginFlags
    /**
     * The plugin status.
     */
    status: PluginStatus
    /**
     * Errors encountered during the plugin lifecycles.
     */
    errors: unknown[]

    /**
     * Disable the plugin. This will also stop the plugin if it is running.
     */
    disable(): Promise<void>
    /**
     * Enable the plugin.
     * @internal
     */
    enable(): Promise<void>
}
