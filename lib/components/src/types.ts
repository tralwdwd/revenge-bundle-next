export interface PluginApiComponents {
    FormSwitch: typeof import('@revenge-mod/components/FormSwitch').default
    Page: typeof import('@revenge-mod/components/Page').default
    SearchInput: typeof import('@revenge-mod/components/SearchInput').default
    TableRowAssetIcon: typeof import('@revenge-mod/components/TableRowAssetIcon').default
}

declare module '@revenge-mod/plugins/types' {
    export interface UnscopedInitPluginApi {
        components: PluginApiComponents
    }
}
