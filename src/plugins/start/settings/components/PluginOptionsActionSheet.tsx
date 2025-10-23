import { getAssetIdByName } from '@revenge-mod/assets'
import { FormSwitch, TableRowAssetIcon } from '@revenge-mod/components'
import {
    ActionSheetActionCreators,
    ToastActionCreators,
} from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { Clipboard } from '@revenge-mod/externals/react-native-clipboard'
import {
    getInternalPluginMeta,
    isPluginEssential,
} from '@revenge-mod/plugins/_'
import { lookupGeneratedIconComponent } from '@revenge-mod/utils/discord'
import { getErrorStack } from '@revenge-mod/utils/error'
import { handleDisablePlugin, handleEnablePlugin } from '../utils/actions'
import {
    openPluginSettings,
    showPluginClearDataConfirmation,
} from '../utils/alerts'
import { PluginInfo } from './PluginCard'
import { usePluginEnabled } from './PluginStateProvider'
import type { AnyPlugin } from '@revenge-mod/plugins/_'

export interface PluginOptionsActionSheetProps {
    plugin: AnyPlugin
    sheetKey: string
}

const { ActionSheet, IconButton, TableRowGroup, TableRow, Stack } = Design

const FileWarningIcon = getAssetIdByName('FileWarningIcon', 'png')!
const SettingsIcon = getAssetIdByName('SettingsIcon', 'png')!

export default function PluginOptionsActionSheet({
    plugin,
    sheetKey,
}: PluginOptionsActionSheetProps) {
    const enabled = usePluginEnabled(plugin)
    const meta = getInternalPluginMeta(plugin)
    const { dependencies, dependents } = meta!
    const essential = isPluginEssential(meta)
    const {
        manifest: { id, name, author, description, icon },
        errors,
        flags,
    } = plugin

    const closeActionSheet = () => {
        ActionSheetActionCreators.hideActionSheet(sheetKey)
    }

    return (
        <ActionSheet>
            <Stack spacing={24} style={{ paddingTop: 8 }}>
                <PluginInfo
                    name={name}
                    author={author}
                    description={description}
                    icon={icon}
                    actions={
                        !essential && (
                            <FormSwitch
                                value={enabled}
                                onValueChange={v => {
                                    if (v) handleEnablePlugin(plugin)
                                    else handleDisablePlugin(plugin)
                                }}
                            />
                        )
                    }
                />
                <Stack
                    direction="horizontal"
                    justify="space-around"
                    style={{ paddingHorizontal: 8, paddingVertical: 16 }}
                >
                    <IconButton
                        variant="secondary"
                        size="lg"
                        icon={FileWarningIcon}
                        label="Clear Data"
                        onPress={() => {
                            showPluginClearDataConfirmation(
                                plugin,
                                closeActionSheet,
                            )
                        }}
                    />
                    {plugin.SettingsComponent && (
                        <Design.IconButton
                            variant="secondary"
                            size="lg"
                            icon={SettingsIcon}
                            label="Settings"
                            onPress={() => {
                                openPluginSettings(plugin)
                                closeActionSheet()
                            }}
                        />
                    )}
                </Stack>
                <TableRowGroup title="Status">
                    <TableRow
                        icon={<TableRowAssetIcon name="FlagIcon" />}
                        label="Flags (TODO)"
                        subLabel={`${flags}`}
                    />
                    {errors.length && (
                        <TableRow
                            variant="danger"
                            label="Errors"
                            icon={
                                <TableRowAssetIcon
                                    variant="danger"
                                    name="CircleXIcon"
                                />
                            }
                            subLabel={`${errors.length} errors. Tap to copy.`}
                            onPress={() => {
                                Clipboard.setString(
                                    errors.map(getErrorStack).join('\n'),
                                )
                                showCopiedToClipboardToast()
                            }}
                        />
                    )}
                </TableRowGroup>
                <TableRowGroup title="Advanced">
                    <TableRow
                        icon={<TableRowAssetIcon name="IdIcon" />}
                        label="ID"
                        subLabel={id}
                        onPress={() => {
                            Clipboard.setString(id)
                            showCopiedToClipboardToast()
                        }}
                    />
                    {dependencies?.length && (
                        <TableRow
                            icon={<TableRowAssetIcon name="ListBulletsIcon" />}
                            label="Dependencies (TODO)"
                            subLabel={`${name} depends on ${dependencies.length} other plugins`}
                        />
                    )}
                    {dependents?.length && (
                        <TableRow
                            icon={<TableRowAssetIcon name="ListBulletsIcon" />}
                            label="Dependents (TODO)"
                            subLabel={`${dependents.length} other plugins depend on ${name}`}
                        />
                    )}
                </TableRowGroup>
            </Stack>
        </ActionSheet>
    )
}

const CopyIcon = lookupGeneratedIconComponent('CopyIcon')!

function showCopiedToClipboardToast() {
    ToastActionCreators.open({
        key: 'REVENGE_PLUGIN_SETTINGS_COPIED',
        content: 'Copied to clipboard',
        IconComponent: CopyIcon,
    })
}
