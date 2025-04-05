import '@revenge-mod/assets/patches'

import { _bl, _mInitingId, _mMetadatas, _mPaths, _mUninited } from './_internal'
import { onAnyModuleInitialized } from './subscriptions'

import { _executeImportedPathSubscription } from './subscriptions/_internal'

const unsubForImportTracker = onAnyModuleInitialized((id, exports) => {
    if (_bl.has(id)) return

    const orig = exports.fileFinishedImporting
    if (orig) {
        unsubForImportTracker()
        exports.fileFinishedImporting = (path: string) => {
            orig(path)
            _mPaths.set(path, _mInitingId)
            _executeImportedPathSubscription(_mInitingId, path)
        }
    }
})
