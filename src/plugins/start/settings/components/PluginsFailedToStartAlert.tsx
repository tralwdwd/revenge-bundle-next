import { Design } from '@revenge-mod/discord/design'
import { RootNavigationRef } from '@revenge-mod/discord/modules/main_tabs_v2'
import { RouteNames } from '../constants'
import type { AnyPlugin } from '@revenge-mod/plugins/_'

const { AlertModal, AlertActionButton, Text } = Design

export default function PluginsFailedToStartAlert({
    plugins,
}: {
    plugins: AnyPlugin[]
}) {
    const navigation = RootNavigationRef.getRootNavigationRef()

    return (
        <AlertModal
            title="Plugins failed to start"
            content={
                <Text variant="text-md/medium" color="header-secondary">
                    The following plugins encountered errors while starting:
                    {'\n'}
                    {plugins.map((plugin, index) => (
                        <>
                            {index ? ', ' : null}
                            <Text
                                key={plugin.manifest.id}
                                variant="text-md/bold"
                                color="text-normal"
                            >
                                {plugin.manifest.name}
                            </Text>
                        </>
                    ))}
                </Text>
            }
            actions={
                <>
                    <AlertActionButton
                        variant="primary"
                        text="View plugins"
                        onPress={() => {
                            const params = {
                                filter: ['Has Errors'],
                            }

                            if (
                                navigation.getCurrentRoute()?.name ===
                                RouteNames.RevengePlugins
                            )
                                navigation.setParams(params)
                            else
                                navigation.navigate(
                                    RouteNames.RevengePlugins,
                                    params,
                                )
                        }}
                    />
                    <AlertActionButton variant="secondary" text="Got it" />
                </>
            }
        />
    )
}
