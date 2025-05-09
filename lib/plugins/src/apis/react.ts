export type PluginApiReact = typeof import('@revenge-mod/react') & {
    jsxRuntime: typeof import('@revenge-mod/react/jsx-runtime')
}

export const react: PluginApiReact = {
    ...require('@revenge-mod/react'),
    jsxRuntime: require('@revenge-mod/react/jsx-runtime'),
}
