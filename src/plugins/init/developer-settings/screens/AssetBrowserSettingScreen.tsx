import { getAssetId, getAssetModuleId, getAssets } from '@revenge-mod/assets'
import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { Clipboard } from '@revenge-mod/externals/react-native-clipboard'
import { FlashList } from '@revenge-mod/externals/shopify'
import { React, ReactNative } from '@revenge-mod/react'
import Page from '~/components/Page'
import SearchInput from '~/components/SearchInput'
import TableRowAssetIcon from '~/components/TableRowAssetIcon'
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
        () =>
            [...getAssets()].map(
                asset =>
                    [
                        getAssetId(asset)!,
                        getAssetModuleId(asset)!,
                        asset,
                    ] as const,
            ),
        [getAssets],
    )

    const filteredAssets = React.useMemo(
        () =>
            !search.length
                ? assets
                : assets.filter(([, , asset]) =>
                      asset.name.toLowerCase().includes(search.toLowerCase()),
                  ),
        [assets, search],
    )

    return (
        <Page spacing={16}>
            <SearchInput onChange={(v: string) => setSearch(v)} size="md" />
            <FlashList.FlashList
                data={filteredAssets}
                estimatedItemSize={80}
                keyExtractor={([id]) => id.toString()}
                renderItem={({ item: [id, moduleId, asset], index }) => (
                    <AssetDisplay
                        asset={asset}
                        end={index === assets.length - 1}
                        id={id}
                        moduleId={moduleId}
                        start={!index}
                    />
                )}
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
            end={end}
            icon={
                isDisplayable ? (
                    <Image source={id} style={styles.smallPreview} />
                ) : (
                    <TableRowAssetIcon
                        name={
                            asset.type in UndisplayableFallback
                                ? UndisplayableFallback[
                                      asset.type as keyof typeof UndisplayableFallback
                                  ]
                                : UndisplayableFallback.default
                        }
                        variant="danger"
                    />
                )
            }
            label={asset.name}
            onPress={() => openAssetDisplayAlert(asset, id, metadata)}
            start={start}
            subLabel={metadata
                .map(([name, value]) => `${name}: ${value}`)
                .join('  • ')}
            variant={isDisplayable ? 'default' : 'danger'}
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
            actions={<AlertActionButton text="Close" variant="secondary" />}
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
                                onPress={() => Clipboard.setString(value)}
                                subLabel={value}
                            />
                        ))}
                    </TableRowGroup>
                    <Text color="text-danger" variant="text-xs/semibold">
                        Note: Asset IDs and module IDs are not consistent
                        between app launches and app versions respectively and
                        should only be used when absolutely needed.
                    </Text>
                </>
            }
            title={asset.name}
        />,
    )
}

function PreviewUnavailable({ type }: { type: string }) {
    return (
        <Text
            color="text-danger"
            style={styles.centeredText}
            variant="text-sm/medium"
        >
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
