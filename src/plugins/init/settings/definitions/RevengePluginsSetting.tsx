import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { _plugins } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import { MobileSetting, UserSettingsSections } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const RevengePluginsSetting: SettingsItem = {
    parent: null,
    type: 'route',
    IconComponent: () => <TableRowAssetIcon name="PuzzlePieceIcon" />,
    title: () => 'Plugins',
    useTrailing: () => {
        let count = 0
        for (const plugin of _plugins.values())
            if (plugin.flags & PluginFlags.Enabled) count++
        return `${count} enabled`
    },
    screen: {
        route: UserSettingsSections[MobileSetting.REVENGE_PLUGINS],
        getComponent: () =>
            require('../screens/RevengePluginsSettingScreen').default,
    },
}

export default RevengePluginsSetting
