import { Design } from '@revenge-mod/discord/design'
import { FlashList } from '@revenge-mod/externals/shopify'
import {
    type InternalPlugin,
    InternalPluginFlags,
    _metas,
    _plugins,
    enablePlugin,
    initPlugin,
    preInitPlugin,
    startPlugin,
} from '@revenge-mod/plugins/_'
import { React, ReactNative } from '@revenge-mod/react'

import FormSwitch from '~/components/FormSwitch'
import Page from '~/components/Page'
import SearchInput from '~/components/SearchInput'

import { getAssetIdByName } from '@revenge-mod/assets'
import { Tokens } from '@revenge-mod/discord/common'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { useReRender } from '@revenge-mod/utils/react'

const { Image, useWindowDimensions } = ReactNative
const { Card, Text, Stack } = Design

export default function RevengePluginsSettingScreen() {
    const [search, setSearch] = React.useState('')

    const { width } = useWindowDimensions()
    const numColumns = Math.floor((width - 16) / 448)

    const plugins = React.useMemo(
        () => [..._plugins.values()].map(plugin => [plugin, _metas.get(plugin.manifest.id)![2]] as const),
        [_plugins],
    )

    const filteredPlugins = React.useMemo(
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
            <SearchInput size="md" onChange={(v: string) => setSearch(v)} />
            <FlashList.MasonryFlashList
                data={filteredPlugins}
                numColumns={numColumns}
                estimatedItemSize={108}
                renderItem={({ item: [plugin, iflags], columnIndex }) => (
                    <InstalledPluginCard
                        key={plugin.manifest.id}
                        plugin={plugin}
                        iflags={iflags}
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
}: { plugin: InternalPlugin; iflags: number; rightGap?: boolean }) {
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
            <Stack direction="horizontal" style={[styles.grow, styles.topContainer]}>
                <Stack spacing={8} direction="horizontal" style={[styles.topContainer, styles.autoSize]}>
                    <Image source={getAssetIdByName(icon ?? 'PuzzlePieceIcon')!} style={styles.icon} />
                    <Text variant="heading-lg/semibold">{name}</Text>
                </Stack>
                <FormSwitch
                    disabled={essential}
                    value={enabled}
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
                />
            </Stack>
            <Stack spacing={4} style={[styles.alignedContainer, styles.grow]}>
                <Text style={styles.grow} variant="heading-md/medium" color="text-muted">
                    by {author}
                </Text>
                <Text style={styles.grow} variant="text-md/medium">
                    {description}
                </Text>
            </Stack>
        </Card>
    )
}
