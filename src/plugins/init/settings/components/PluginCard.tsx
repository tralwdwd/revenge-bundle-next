import { getAssetIdByName } from '@revenge-mod/assets'
import { styles } from '@revenge-mod/components/_'
import FormSwitch from '@revenge-mod/components/FormSwitch'
import { Tokens } from '@revenge-mod/discord/common'
import { Design } from '@revenge-mod/discord/design'
import { ReactNavigationNative } from '@revenge-mod/externals/react-navigation'
import {
    enablePlugin,
    InternalPluginFlags,
    initPlugin,
    preInitPlugin,
    startPlugin,
} from '@revenge-mod/plugins/_'
import { memo } from 'react'
import { Image, Pressable } from 'react-native'
import { useClickOutside } from 'react-native-click-outside'
import { usePluginEnabled } from './PluginStateProvider'
import {
    enableTooltipTarget,
    essentialTooltipTarget,
    resetTooltips,
    setEnablePluginTooltipVisible,
    setEssentialPluginTooltipVisible,
} from './TooltipProvider'
import type { AnyPlugin, InternalPluginMeta } from '@revenge-mod/plugins/_'
import type { View } from 'react-native'

const { Card, Text, Stack, IconButton, createStyles } = Design

const PuzzlePieceIcon = getAssetIdByName('PuzzlePieceIcon', 'png')!
const SettingsIcon = getAssetIdByName('SettingsIcon', 'png')!

export const InstalledPluginCard = memo(function InstalledPluginCard({
    plugin,
    meta,
    rightGap,
}: {
    plugin: AnyPlugin
    meta: InternalPluginMeta
    rightGap?: boolean
}) {
    const navigation = ReactNavigationNative.useNavigation()
    const enabled = usePluginEnabled(plugin)

    const {
        manifest: { name, description, author, icon },
    } = plugin

    const essential = Boolean(meta.iflags & InternalPluginFlags.Essential)
    const styles_ = usePluginCardStyles()

    const settingsRef = useClickOutside<View>(() => {
        if (enableTooltipTarget.current === settingsRef.current)
            setEnablePluginTooltipVisible?.(false)
    })

    const switchRef = useClickOutside<View>(() => {
        if (essentialTooltipTarget.current === switchRef.current)
            setEssentialPluginTooltipVisible?.(false)
    })

    return (
        <Card style={[styles_.card, styles.grow, rightGap && styles_.rightGap]}>
            <Stack
                direction="horizontal"
                style={[styles.grow, styles_.topContainer]}
            >
                <Stack
                    direction="horizontal"
                    spacing={8}
                    style={[styles_.topContainer, styles.flex]}
                >
                    <Image
                        source={icon ? getAssetIdByName(icon) : PuzzlePieceIcon}
                        style={styles_.icon}
                    />
                    <Text variant="heading-lg/semibold">{name}</Text>
                </Stack>
                {plugin.SettingsComponent && (
                    <Pressable
                        onPress={e => {
                            if (enabled) return

                            e.stopPropagation()
                            resetTooltips()

                            requestAnimationFrame(() => {
                                enableTooltipTarget.current =
                                    settingsRef.current
                                setEnablePluginTooltipVisible?.(true)
                            })
                        }}
                    >
                        <IconButton
                            ref={settingsRef}
                            size="sm"
                            variant="secondary"
                            icon={SettingsIcon}
                            onPress={() => {
                                navigation.navigate(plugin.manifest.id)
                            }}
                            disabled={!enabled}
                        />
                    </Pressable>
                )}
                <Pressable
                    onPress={e => {
                        if (essential) {
                            e.stopPropagation()
                            resetTooltips()

                            requestAnimationFrame(() => {
                                essentialTooltipTarget.current =
                                    switchRef.current
                                setEssentialPluginTooltipVisible?.(true)
                            })
                        }
                    }}
                    ref={switchRef}
                >
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
                        }}
                        value={enabled}
                    />
                </Pressable>
            </Stack>
            <Stack spacing={4} style={[styles_.alignedContainer, styles.grow]}>
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
