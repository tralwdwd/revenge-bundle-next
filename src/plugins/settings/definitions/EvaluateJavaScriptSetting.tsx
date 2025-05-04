import { React } from '@revenge-mod/react'

import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { nodeUtils } from '@revenge-mod/discord/polyfills'
import { Components } from '@revenge-mod/discord/ui'

import { getErrorStack } from '@revenge-mod/utils/errors'

import AssetIcon from '../components/icons/AssetIcon'

import type { SettingsItem } from '@revenge-mod/discord/ui/settings'

const ALERT_KEY = 'evaluate-javascript'

const EvaluateJavaScriptSetting: SettingsItem = {
    parent: null,
    IconComponent: () => <AssetIcon name="FileIcon" />,
    title: () => 'Evaluate JavaScript',
    useDescription: () => 'Runs a JavaScript code snippet.',
    onPress: () => AlertActionCreators.openAlert(ALERT_KEY, <EvaluateJavaScriptAlert />),
    type: 'pressable',
}

const {
    AlertActionButton,
    AlertModal,
    Button,
    Slider,
    Stack,
    TableRow,
    TableRowGroup,
    TableSwitchRow,
    Text,
    TextArea,
} = Components

function EvaluateJavaScriptAlert() {
    const code = React.useRef('')
    const [awaitResult, setAwaitResult] = React.useState(true)
    const [showHidden, setShowHidden] = React.useState(true)
    const [inspectDepth, setInspectDepth] = React.useState(3)
    const [loading, setLoading] = React.useState(false)

    return (
        <AlertModal
            title="Evaluate JavaScript"
            extraContent={
                <Stack>
                    <TextArea
                        autoFocus
                        label="Code"
                        size="md"
                        placeholder="ReactNative.NativeModules.BundleUpdaterManager.reload()"
                        onChange={v => (code.current = v)}
                    />
                    <TableRowGroup>
                        <TableSwitchRow
                            label="Await result"
                            subLabel="Wait for the result of the code before displaying it."
                            value={awaitResult}
                            onValueChange={setAwaitResult}
                        />
                        <TableSwitchRow
                            label="Show hidden"
                            subLabel="Show hidden properties of the object."
                            value={showHidden}
                            onValueChange={setShowHidden}
                        />
                        <TableRow
                            label="Inspect depth"
                            subLabel="The depth of the object to inspect."
                            trailing={<Text>{inspectDepth}</Text>}
                        />
                        <Slider
                            startIcon={<Text>1</Text>}
                            endIcon={<Text>10</Text>}
                            step={1}
                            minimumValue={1}
                            maximumValue={10}
                            value={inspectDepth}
                            onValueChange={setInspectDepth}
                        />
                    </TableRowGroup>
                </Stack>
            }
            actions={
                <Stack>
                    <Button
                        text="Evaluate"
                        variant="primary"
                        loading={loading}
                        // Async arrow functions are not supported
                        onPress={async function onPress() {
                            setLoading(true)

                            try {
                                // Do a no-local-scope-access eval
                                // biome-ignore lint/security/noGlobalEval: This is intentional
                                const res = globalThis.eval?.(code.current)
                                alert(
                                    nodeUtils.inspect(awaitResult && res instanceof Promise ? await res : res, {
                                        depth: inspectDepth,
                                        showHidden,
                                    }),
                                )
                            } catch (e) {
                                alert(getErrorStack(e))
                            }

                            setLoading(false)
                            AlertActionCreators.dismissAlert(ALERT_KEY)
                        }}
                    />
                    <AlertActionButton text="Cancel" variant="secondary" />
                </Stack>
            }
        />
    )
}

export default EvaluateJavaScriptSetting
