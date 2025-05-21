import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { Clipboard } from '@revenge-mod/externals/react-native-clipboard'
import { FlashList } from '@revenge-mod/externals/shopify'
import { React, ReactNative } from '@revenge-mod/react'

import Page from '~/components/Page'
import SearchInput from '~/components/SearchInput'
import TableRowAssetIcon from '~/components/TableRowAssetIcon'

import { getAllAssets, getAssetId, getAssetModuleId } from '@revenge-mod/assets'

import type { Asset, AssetId } from '@revenge-mod/assets/types'
import type { Metro } from '@revenge-mod/modules/types'

const { Image, StyleSheet } = ReactNative
const { AlertModal, AlertActionButton, TableRow, TableRowGroup, Text } = Design

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
        () => [...getAllAssets()].map(asset => [getAssetId(asset)!, getAssetModuleId(asset)!, asset] as const),
        [getAllAssets],
    )

    const filteredAssets = React.useMemo(
        () =>
            !search.length
                ? assets
                : assets.filter(([, , asset]) => asset.name.toLowerCase().includes(search.toLowerCase())),
        [assets, search],
    )

    return (
        <Page spacing={16}>
            <SearchInput size="md" onChange={(v: string) => setSearch(v)} />
            <FlashList.FlashList
                data={filteredAssets}
                keyExtractor={([id]) => id.toString()}
                renderItem={({ item: [id, moduleId, asset], index }) => (
                    <AssetDisplay
                        start={!index}
                        end={index === assets.length - 1}
                        id={id}
                        moduleId={moduleId}
                        asset={asset}
                    />
                )}
                estimatedItemSize={80}
            />
        </Page>
    )
}

function AssetDisplay({
    id,
    moduleId,
    asset,
    start,
    end,
}: {
    id: AssetId
    moduleId: Metro.ModuleID
    asset: Asset
    start?: boolean
    end?: boolean
}) {
    const isDisplayable = Displayable.has(asset.type)
    const metadata = [
        ['ID', id.toString()],
        ['Type', asset.type],
        ['Module ID', moduleId.toString()],
    ] as const

    return (
        <TableRow
            start={start}
            end={end}
            variant={isDisplayable ? 'default' : 'danger'}
            label={asset.name}
            subLabel={metadata.map(([name, value]) => `${name}: ${value}`).join('  • ')}
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
            onPress={() => openAssetDisplayAlert(asset, id, metadata)}
        />
    )
}

function openAssetDisplayAlert(
    asset: Asset,
    id: AssetId,
    metadata: Readonly<Readonly<[string, string]>[]> | [string, string][],
) {
    const isDisplayable = Displayable.has(asset.type)

    AlertActionCreators.openAlert(
        'asset-display',
        <AlertModal
            title={asset.name}
            extraContent={
                <>
                    {isDisplayable ? (
                        <Image source={id} style={styles.preview} />
                    ) : (
                        <PreviewUnavailable type={asset.type} />
                    )}
                    <TableRowGroup>
                        {metadata.map(([name, value]) => (
                            <TableRow
                                key={id}
                                label={name}
                                subLabel={value}
                                onPress={() => Clipboard.setString(value)}
                            />
                        ))}
                    </TableRowGroup>
                    <Text variant="text-xs/semibold" color="text-danger">
                        Note: Asset IDs and module IDs are not consistent between app launches and app versions
                        respectively and should only be used when absolutely needed.
                    </Text>
                </>
            }
            actions={<AlertActionButton text="Close" variant="secondary" />}
        />,
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
