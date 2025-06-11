import { getAssetIdByName } from '@revenge-mod/assets'
import FormSwitch from '@revenge-mod/components/FormSwitch'
import Page from '@revenge-mod/components/Page'
import SearchInput from '@revenge-mod/components/SearchInput'
import { ActionSheetActionCreators } from '@revenge-mod/discord/actions'
import { Tokens } from '@revenge-mod/discord/common'
import { Design } from '@revenge-mod/discord/design'
import { ReactNavigationNative } from '@revenge-mod/externals/react-navigation'
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
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Image,
    Pressable,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native'
import {
    ClickOutsideProvider,
    useClickOutside,
} from 'react-native-click-outside'
import { navigatePluginSettings } from '../utils'
import type { RouteProp } from '@react-navigation/core'
import type { ReactNavigationParamList } from '@revenge-mod/externals/react-navigation'
import type { InternalPlugin } from '@revenge-mod/plugins/_'
import type { MutableRefObject } from 'react'
import type { FilterAndSortActionSheetProps } from '../components/FilterAndSortActionSheet'
import type { RouteNames, Setting } from '../constants'

const { Card, Text, Stack, IconButton, LayerScope, useTooltip, createStyles } =
    Design

export default function RevengePluginsSettingScreen() {
    return (
        <LayerScope>
            <ClickOutsideProvider>
                <Page spacing={16}>
                    <Screen />
                </Page>
            </ClickOutsideProvider>
        </LayerScope>
    )
}

/*
    Only one tooltip can be visible at a time, so we use a global state to control the visibility of the tooltip.
    Why? Because we don't want to run useTooltip on every single plugin card. This is ugly, but it works.
*/

let setTooltipVisible: ((v: boolean) => void) | undefined
const tooltipTargetRef: MutableRefObject<View | null> = { current: null }

function EnablePluginTooltipProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setTooltipVisible = setVisible
        return () => {
            setTooltipVisible = undefined
        }
    }, [])

    useTooltip(tooltipTargetRef, {
        label: 'Enable plugin to access settings',
        position: 'top',
        visible,
    })

    return children
}

const SearchDebounceTime = 100

const FilterAndSortActionSheetKey = 'filter-and-sort-plugins'

const DefaultSort: keyof typeof Sorts = 'Name (A-Z)'
const Sorts = {
    'Name (A-Z)': (a, b) => a.manifest.name.localeCompare(b.manifest.name),
    'Name (Z-A)': (a, b) => b.manifest.name.localeCompare(a.manifest.name),
    'Enabled first': (a, b) =>
        (b.flags & PluginFlags.Enabled) - (a.flags & PluginFlags.Enabled),
    'Disabled first': (a, b) =>
        (a.flags & PluginFlags.Enabled) - (b.flags & PluginFlags.Enabled),
} satisfies FilterAndSortActionSheetProps<string>['sorts']

function Screen() {
    const { width } = useWindowDimensions()

    const navigation = ReactNavigationNative.useNavigation()
    const route =
        ReactNavigationNative.useRoute<
            RouteProp<
                ReactNavigationParamList,
                (typeof RouteNames)[typeof Setting.RevengePlugins]
            >
        >()

    const [search, setSearch] = useState('')
    const debouncedSetSearch = useCallback(
        debounce(setSearch, SearchDebounceTime),
        [],
    )

    const [sort, setSort] = useState(
        (route.params?.sort as keyof typeof Sorts) ?? DefaultSort,
    )

    const allPlugins = useMemo(
        () =>
            [..._plugins.values()].map(
                plugin => [plugin, _metas.get(plugin.manifest.id)![2]] as const,
            ),
        [],
    )

    const plugins = useMemo(
        () =>
            allPlugins
                .filter(([plugin]) => {
                    const { name, description, author } = plugin.manifest
                    const query = search.toLowerCase()
                    return (
                        name.toLowerCase().includes(query) ||
                        description.toLowerCase().includes(query) ||
                        author.toLowerCase().includes(query)
                    )
                })
                .sort(([a], [b]) => Sorts[sort](a, b)),
        [allPlugins, search, sort],
    )

    useEffect(() => {
        navigation.setParams({ sort })
        ActionSheetActionCreators.hideActionSheet(FilterAndSortActionSheetKey)
    }, [sort, navigation.setParams])

    return (
        <EnablePluginTooltipProvider>
            <Stack direction="horizontal">
                <View style={styles.flex}>
                    <SearchInput
                        onChange={(v: string) => debouncedSetSearch(v)}
                        size="md"
                    />
                </View>
                <IconButton
                    icon={getAssetIdByName('ArrowsUpDownIcon')!}
                    variant="tertiary"
                    onPress={() =>
                        ActionSheetActionCreators.openLazy(
                            import(
                                '../components/FilterAndSortActionSheet'
                            ) as Promise<{
                                default: typeof import('../components/FilterAndSortActionSheet').default<
                                    keyof typeof Sorts
                                >
                            }>,
                            FilterAndSortActionSheetKey,
                            {
                                sorts: Sorts,
                                selectedSort: sort,
                                onSelectSort: setSort,
                            },
                        )
                    }
                />
            </Stack>
            <PluginMasonryFlashList
                plugins={plugins}
                numColumns={Math.floor((width - 16) / 448)}
            />
        </EnablePluginTooltipProvider>
    )
}

function PluginMasonryFlashList({
    plugins,
    numColumns,
}: {
    plugins: (readonly [InternalPlugin, number])[]
    numColumns: number
}) {
    return (
        <FlashList.MasonryFlashList
            fadingEdgeLength={16}
            onScrollBeginDrag={() => setTooltipVisible?.(false)}
            data={plugins}
            estimatedItemSize={116}
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
    )
}

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
    const styles_ = usePluginCardStyles()
    const ref = useClickOutside<View>(() => setTooltipVisible?.(false))

    return (
        <Card style={[styles_.card, styles.flex, rightGap && styles_.rightGap]}>
            <Stack
                direction="horizontal"
                style={[styles.flex, styles_.topContainer]}
            >
                <Stack
                    direction="horizontal"
                    spacing={8}
                    style={[styles_.topContainer, styles.flex]}
                >
                    <Image
                        source={getAssetIdByName(icon ?? 'PuzzlePieceIcon')!}
                        style={styles_.icon}
                    />
                    <Text variant="heading-lg/semibold">{name}</Text>
                </Stack>
                {plugin.SettingsComponent && (
                    <Pressable
                        onPress={e => {
                            if (enabled) return

                            e.stopPropagation()
                            tooltipTargetRef.current = ref.current

                            setTooltipVisible?.(true)
                        }}
                    >
                        <IconButton
                            ref={ref}
                            size="sm"
                            variant="secondary"
                            icon={getAssetIdByName('SettingsIcon')!}
                            onPress={() => navigatePluginSettings(plugin)}
                            disabled={!enabled}
                        />
                    </Pressable>
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

                        // TODO(plugins/settings): handle sorting after plugin enabled/disabled
                        // TODO(plugins/settings): show ReloadRequired modal
                        // make an event based system for this, so we can register a listener for when plugins are disabled
                        // and update the UI accordingly
                    }}
                    value={enabled}
                />
            </Stack>
            <Stack spacing={4} style={[styles_.alignedContainer, styles.flex]}>
                <Text
                    color="text-muted"
                    style={styles.flex}
                    variant="heading-md/medium"
                >
                    by {author}
                </Text>
                <Text style={styles.flex} variant="text-md/medium">
                    {description}
                </Text>
            </Stack>
        </Card>
    )
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
})

const usePluginCardStyles = createStyles({
    icon: {
        width: 20,
        height: 20,
        tintColor: Tokens.default.colors.TEXT_NORMAL,
    },
    card: {
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
})
