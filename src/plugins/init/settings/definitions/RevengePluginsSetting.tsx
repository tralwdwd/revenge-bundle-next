import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { BundleUpdaterManager } from '@revenge-mod/discord/native'
import { _emitter, _plugins } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { useReRender } from '@revenge-mod/utils/react'
import { useEffect } from 'react'
import { RouteNames, Setting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'
import type { InternalPlugin } from '@revenge-mod/plugins/_'

const RevengePluginsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="PuzzlePieceIcon" />,
    title: () => 'Plugins',
    useTrailing: () => {
        useUpdateOnPluginStatesChange()
        return `${enabledCount} enabled`
    },
    screen: {
        route: RouteNames[Setting.RevengePlugins],
        getComponent: () =>
            require('../screens/RevengePluginsSettingScreen').default,
    },
}

let enabledCount = 0

for (const plugin of _plugins.values())
    if (plugin.flags & PluginFlags.Enabled) enabledCount++

_emitter.on('disabled', () => enabledCount--)
_emitter.on('enabled', () => enabledCount++)

export function useUpdateOnPluginStatesChange() {
    const reRender = useReRender()

    useEffect(() => {
        _emitter.on('disabled', reRender)
        _emitter.on('enabled', reRender)

        return () => {
            _emitter.off('disabled', reRender)
            _emitter.off('enabled', reRender)
        }
    }, [reRender])
}

const { AlertActionButton, AlertModal, Text } = Design

_emitter.on('started', showReloadRequiredAlert)
_emitter.on('stopped', showReloadRequiredAlert)

function showReloadRequiredAlert(plugin: InternalPlugin) {
    if (plugin.flags & PluginFlags.ReloadRequired) {
        AlertActionCreators.openAlert(
            'plugin-reload-required',
            <AlertModal
                title="Reload required"
                content={
                    <Text variant="text-md/medium" color="header-secondary">
                        Plugin{' '}
                        <Text variant="text-md/bold" color="header-secondary">
                            {plugin.manifest.name}
                        </Text>{' '}
                        requires a reload to apply changes.
                    </Text>
                }
                actions={
                    <>
                        <AlertActionButton
                            variant="destructive"
                            text="Reload"
                            onPress={() => BundleUpdaterManager.reload()}
                        />
                        <AlertActionButton variant="secondary" text="Not now" />
                    </>
                }
            />,
        )
    }
}

export default RevengePluginsSetting
