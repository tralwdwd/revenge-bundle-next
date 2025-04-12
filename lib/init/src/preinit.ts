import { patchMetroDefine } from '@revenge-mod/modules/_/metro'
import { interceptProperty } from '@revenge-mod/utils/objects'

// By doing this, we are assuming __METRO_GLOBAL_PREFIX is an empty string
// and globalThis.__d isn't already set (which should be the case anyways)
const unintercept = interceptProperty('__d', (_, mDefine) => (unintercept(), patchMetroDefine(mDefine)))
