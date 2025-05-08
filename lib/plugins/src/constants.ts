export const PluginFlags = {
    /**
     * The plugin is enabled.
     */
    Enabled: 1 << 0,
    /**
     * The plugin requires a reload to apply changes.
     */
    ReloadRequired: 1 << 1,
    /**
     * The plugin has errors.
     */
    Errored: 1 << 2,
}

export const PluginStatus = {
    Initing: 1 << 0,
    Inited: 1 << 1,
    Starting: 1 << 2,
    Started: 1 << 3,
    Stopping: 1 << 4,
}
