import TableRowAssetIcon from '~/components/TableRowAssetIcon'
import { api } from '..'
import { MobileSetting } from '../constants'
import { DevToolsContext } from '../react-devtools'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ReactDevToolsAutoConnectSetting: SettingsItem = {
    parent: MobileSetting.REVENGE_DEVELOPER,
    IconComponent: () => <TableRowAssetIcon name="LinkIcon" />,
    title: () => 'Auto-connect to React DevTools',
    useDescription: () =>
        'Automatically connect to React DevTools during startup.',
    usePredicate: () => DevToolsContext.available,
    useValue: () =>
        api.storage.use(s => s.devtools?.autoConnect !== undefined)!.devtools
            .autoConnect,
    onValueChange: v => api.storage.set({ devtools: { autoConnect: v } }),
    type: 'toggle',
}

export default ReactDevToolsAutoConnectSetting
