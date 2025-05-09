import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { Components } from '@revenge-mod/discord/design'
import { Clipboard } from '@revenge-mod/externals/react-native-clipboard'
import { FlashList } from '@revenge-mod/externals/shopify'
import { React, ReactNative } from '@revenge-mod/react'

import Page from '~/components/Page'
import SearchInput from '~/components/SearchInput'
import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { getAllAssets, getAssetId } from '@revenge-mod/assets'

import type { Asset, AssetId } from '@revenge-mod/assets/types'

const { Image, StyleSheet, View } = ReactNative
const { AlertModal, AlertActionButton, TableRow, Text, Stack } = Components

const Displayable = new Set(['png', 'jpg', 'svg', 'webp'])
const UndisplayableFallback = {
    jsona: 'ic_file_text',
    lottie: 'ic_image',
    webm: 'CirclePlayIcon-primary',
    ttf: 'ic_add_text',
    default: 'UnknownGameIcon',
}

export default function AssetBrowserSettingScreen() {
    const [search, setSearch] = React.useState('')
    const assets = React.useMemo(
        () => [...getAllAssets()].map(asset => [getAssetId(asset)!, asset] as const),
        [getAllAssets],
    )

    const filteredAssets = React.useMemo(
        () =>
            !search.length
                ? assets
                : assets.filter(([_, asset]) => asset.name.toLowerCase().includes(search.toLowerCase())),
        [assets, search],
    )

    return (
        <Page spacing={16}>
            <SearchInput size="md" onChange={(v: string) => setSearch(v)} />
            <View style={styles.listContainer}>
                <FlashList.FlashList
                    data={filteredAssets}
                    renderItem={({ item: [id, asset] }) => <AssetDisplay id={id} asset={asset} />}
                    estimatedItemSize={80}
                />
            </View>
        </Page>
    )
}

function AssetDisplay({
    id,
    asset,
}: {
    id: AssetId
    asset: Asset
}) {
    const isDisplayable = Displayable.has(asset.type)
    const metadata = [`ID: ${id}`, `Type: ${asset.type}`]

    return (
        <TableRow
            variant={isDisplayable ? 'default' : 'danger'}
            label={asset.name}
            subLabel={metadata.join('  • ')}
            icon={
                isDisplayable ? (
                    <Image source={id} style={styles.smallPreview} />
                ) : (
                    <TableRowAssetIcon
                        variant="danger"
                        name={
                            asset.type in UndisplayableFallback
                                ? UndisplayableFallback[asset.type as keyof typeof UndisplayableFallback]
                                : UndisplayableFallback.default
                        }
                    />
                )
            }
            onPress={() =>
                AlertActionCreators.openAlert(
                    'asset-display',
                    <AlertModal
                        title={asset.name}
                        content={metadata.join(' • ')}
                        extraContent={
                            isDisplayable ? (
                                <Image source={id} style={styles.preview} />
                            ) : (
                                <PreviewUnavailable type={asset.type} />
                            )
                        }
                        actions={
                            <Stack>
                                <AlertActionButton
                                    text="Copy asset name"
                                    variant="primary"
                                    onPress={() => Clipboard.setString(asset.name)}
                                />
                                <AlertActionButton
                                    text="Copy asset ID"
                                    variant="secondary"
                                    onPress={() => Clipboard.setString(id.toString())}
                                />
                            </Stack>
                        }
                    />,
                )
            }
        />
    )
}

function PreviewUnavailable({ type }: { type: string }) {
    return (
        <Text variant="text-sm/medium" color="text-danger" style={styles.centeredText}>
            Asset type {type.toUpperCase()} is not supported for preview.
        </Text>
    )
}

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    smallPreview: {
        height: 32,
        width: 32,
    },
    preview: {
        flex: 1,
        width: 'auto',
        height: 192,
        resizeMode: 'contain',
    },
    centeredText: {
        width: '100%',
        textAlign: 'center',
    },
})
