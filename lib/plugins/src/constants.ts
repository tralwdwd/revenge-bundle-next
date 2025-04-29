export const PluginFlags = {
    /**
     * The plugin is enabled.
     */
    Enabled: 1 << 0,
    /**
     * The plugin is an internal plugin.
     */
    Internal: 1 << 1,
    /**
     * The plugin requires a reload to apply changes.
     */
    ReloadRequired: 1 << 2,
    /**
     * The plugin is initialized or initializing.
     */
    StatusInit: 1 << 3,
    /**
     * The plugin is started or starting.
     */
    StatusStart: 1 << 4,
    /**
     * The plugin is actioning something, such as initializing or starting.
     */
    StatusActioning: 1 << 5,
    /**
     * The plugin has errors.
     */
    Errored: 1 << 6,
}

export type PluginFlags = (typeof PluginFlags)[keyof typeof PluginFlags]
