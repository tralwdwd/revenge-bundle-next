import TableRowAssetIcon from '@revenge-mod/components/TableRowAssetIcon'
import { AlertActionCreators } from '@revenge-mod/discord/actions'
import { Design } from '@revenge-mod/discord/design'
import { nodeUtil } from '@revenge-mod/externals/browserify'
import { getErrorStack } from '@revenge-mod/utils/errors'
import { useRef, useState } from 'react'
import { api } from '..'
import { Setting } from '../constants'
import type { SettingsItem } from '@revenge-mod/discord/modules/settings'

const ALERT_KEY = 'evaluate-javascript'

const EvalJSSetting: SettingsItem = {
    parent: Setting.RevengeDeveloper,
    IconComponent: () => <TableRowAssetIcon name="FileIcon" />,
    title: () => 'Evaluate JavaScript',
    useDescription: () => 'Runs a JavaScript code snippet.',
    onPress: () => AlertActionCreators.openAlert(ALERT_KEY, <EvalJSAlert />),
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
} = Design

function EvalJSAlert() {
    const code = useRef('')
    const [awaitResult, setAwaitResult] = useState(true)
    const [showHidden, setShowHidden] = useState(true)
    const [inspectDepth, setInspectDepth] = useState(3)
    const [loading, setLoading] = useState(false)

    return (
        <AlertModal
            actions={
                <Stack>
                    <Button
                        loading={loading}
                        onPress={async function onPress() {
                            setLoading(true)

                            try {
                                if (!api) {
                                    alert(
                                        'Unable to provide plugin API. Running snippet in a second...',
                                    )
                                    await new Promise(rs =>
                                        setTimeout(rs, 1000),
                                    )
                                } else {
                                    // @ts-expect-error
                                    globalThis.revenge = api.unscoped
                                    // @ts-expect-error
                                    globalThis.api = api
                                }

                                // Do a no-local-scope-access eval
                                // biome-ignore lint/security/noGlobalEval: This is intentional
                                const res = globalThis.eval?.(code.current)

                                alert(
                                    nodeUtil.inspect(
                                        awaitResult && res instanceof Promise
                                            ? await res
                                            : res,
                                        {
                                            depth: inspectDepth,
                                            showHidden,
                                        },
                                    ),
                                )

                                // @ts-expect-error
                                // biome-ignore lint/performance/noDelete: This is fine.
                                delete globalThis.revenge, delete globalThis.api
                            } catch (e) {
                                alert(getErrorStack(e))
                            }

                            setLoading(false)
                            AlertActionCreators.dismissAlert(ALERT_KEY)
                        }}
                        text="Evaluate"
                        // Async arrow functions are not supported
                        variant="primary"
                    />
                    <AlertActionButton text="Cancel" variant="secondary" />
                </Stack>
            }
            extraContent={
                <Stack>
                    <TextArea
                        autoFocus
                        label="Code"
                        onChange={v => (code.current = v)}
                        placeholder="ReactNative.NativeModules.BundleUpdaterManager.reload()"
                        size="md"
                    />
                    <TableRowGroup>
                        <TableSwitchRow
                            label="Await result"
                            onValueChange={setAwaitResult}
                            subLabel="Wait for the result of the code before displaying it."
                            value={awaitResult}
                        />
                        <TableSwitchRow
                            label="Show hidden"
                            onValueChange={setShowHidden}
                            subLabel="Show hidden properties of the object."
                            value={showHidden}
                        />
                        <TableRow
                            label="Inspect depth"
                            subLabel="The depth of the object to inspect."
                            trailing={<Text>{inspectDepth}</Text>}
                        />
                        <Slider
                            endIcon={<Text>10</Text>}
                            maximumValue={10}
                            minimumValue={1}
                            onValueChange={setInspectDepth}
                            startIcon={<Text>1</Text>}
                            step={1}
                            value={inspectDepth}
                        />
                    </TableRowGroup>
                </Stack>
            }
            title="Evaluate JavaScript"
        />
    )
}

export default EvalJSSetting
