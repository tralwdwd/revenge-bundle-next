import { getAssetIdByName } from '@revenge-mod/assets'
import FormSwitch from '@revenge-mod/components/FormSwitch'
import Page from '@revenge-mod/components/Page'
import SearchInput from '@revenge-mod/components/SearchInput'
import { Tokens } from '@revenge-mod/discord/common'
import { Design } from '@revenge-mod/discord/design'
import { RootNavigationRef } from '@revenge-mod/discord/modules/main_tabs_v2'
import { FlashList } from '@revenge-mod/externals/shopify'
import {
    _metas,
    _plugins,
    enablePlugin,
    InternalPluginFlags,
    initPlugin,
    preInitPlugin,
    startPlugin,
} from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { debounce } from '@revenge-mod/utils/callbacks'
import { useReRender } from '@revenge-mod/utils/react'
import { createElement, useCallback, useMemo, useState } from 'react'
import { Image, useWindowDimensions } from 'react-native'
import { RouteNames, Setting } from '../constants'
import type { InternalPlugin } from '@revenge-mod/plugins/_'
import type { PluginApi } from '@revenge-mod/plugins/types'

const { Card, Text, Stack } = Design

export default function RevengePluginsSettingScreen() {
    const [search, setSearch] = useState('')
    const debouncedSetSearch = useCallback(debounce(setSearch, 100), [])

    const { width } = useWindowDimensions()
    const numColumns = Math.floor((width - 16) / 448)

    const plugins = useMemo(
        () =>
            [..._plugins.values()].map(
                plugin => [plugin, _metas.get(plugin.manifest.id)![2]] as const,
            ),
        [],
    )

    const filteredPlugins = useMemo(
        () =>
            plugins.filter(([plugin]) => {
                const { name, description, author } = plugin.manifest
                const query = search.toLowerCase()
                return (
                    name.toLowerCase().includes(query) ||
                    description.toLowerCase().includes(query) ||
                    author.toLowerCase().includes(query)
                )
            }),
        [plugins, search],
    )

    return (
        <Page spacing={16}>
            <SearchInput
                onChange={(v: string) => debouncedSetSearch(v)}
                size="md"
            />
            <FlashList.MasonryFlashList
                data={filteredPlugins}
                estimatedItemSize={108}
                numColumns={numColumns}
                renderItem={({ item: [plugin, iflags], columnIndex }) => (
                    <InstalledPluginCard
                        iflags={iflags}
                        key={plugin.manifest.id}
                        plugin={plugin}
                        rightGap={columnIndex + 1 < numColumns}
                    />
                )}
            />
        </Page>
    )
}

const usePluginCardStyles = Design.createStyles({
    icon: {
        width: 20,
        height: 20,
        tintColor: Tokens.default.colors.TEXT_NORMAL,
    },
    card: {
        flexGrow: 1,
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 4,
    },
    rightGap: {
        marginRight: 12,
    },
    topContainer: {
        alignItems: 'center',
    },
    alignedContainer: {
        paddingLeft: 28,
    },
    grow: {
        flexGrow: 1,
    },
    autoSize: {
        flex: 1,
    },
})

function InstalledPluginCard({
    plugin,
    iflags,
    rightGap,
}: {
    plugin: InternalPlugin
    iflags: number
    rightGap?: boolean
}) {
    const {
        manifest: { name, description, author, icon },
        flags,
    } = plugin

    const reRender = useReRender()
    const essential = Boolean(iflags & InternalPluginFlags.Essential)
    const enabled = Boolean(flags & PluginFlags.Enabled)
    const styles = usePluginCardStyles()

    return (
        <Card style={[styles.card, rightGap && styles.rightGap]}>
            <Stack
                direction="horizontal"
                style={[styles.grow, styles.topContainer]}
            >
                <Stack
                    direction="horizontal"
                    spacing={8}
                    style={[styles.topContainer, styles.autoSize]}
                >
                    <Image
                        source={getAssetIdByName(icon ?? 'PuzzlePieceIcon')!}
                        style={styles.icon}
                    />
                    <Text variant="heading-lg/semibold">{name}</Text>
                </Stack>
                {plugin.SettingsComponent && (
                    <Design.IconButton
                        size="sm"
                        variant="secondary"
                        icon={getAssetIdByName('SettingsIcon')!}
                        onPress={() => navigatePluginSettings(plugin)}
                    />
                )}
                <FormSwitch
                    disabled={essential}
                    // biome-ignore lint/complexity/useArrowFunction: Async arrows are not supported
                    onValueChange={async function (v) {
                        if (v) {
                            await enablePlugin(plugin, true)
                            await preInitPlugin(plugin)
                            await initPlugin(plugin)
                            await startPlugin(plugin)
                        } else await plugin.disable()

                        reRender()

                        // TODO(plugins/settings): show ReloadRequired modal
                        // make an event based system for this, so we can register a listener for when plugins are disabled
                        // and check its flags afterwards
                    }}
                    value={enabled}
                />
            </Stack>
            <Stack spacing={4} style={[styles.alignedContainer, styles.grow]}>
                <Text
                    color="text-muted"
                    style={styles.grow}
                    variant="heading-md/medium"
                >
                    by {author}
                </Text>
                <Text style={styles.grow} variant="text-md/medium">
                    {description}
                </Text>
            </Stack>
        </Card>
    )
}

// TODO(plugins/settings): Register a custom route instead, so plugin "settings" can actually be pinned and navigated to without hassle.
// This would require us to implement the event-based plugin management system first, so we can listen to plugin enable/disable events and update the settings accordingly.
export function navigatePluginSettings(plugin: InternalPlugin) {
    const [api] = _metas.get(plugin.manifest.id)!
    const navigation = RootNavigationRef.getRootNavigationRef()
    if (!navigation.isReady()) return

    navigation.navigate(RouteNames[Setting.RevengeCustomPage], {
        render: () =>
            createElement(plugin.SettingsComponent!, {
                api: api as PluginApi,
            }),
        options: {
            title: plugin.manifest.name,
        },
    })
}
