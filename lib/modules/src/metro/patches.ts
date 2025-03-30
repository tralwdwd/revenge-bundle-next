import { _mMetadatas, _mInitingId, _mPaths, _mUninited, _bl } from './_internal'
import { onAnyModuleInitialized } from './subscriptions'

import '@revenge-mod/assets/patches'
import { _executeImportedPathSubscription } from './subscriptions/_internal'

const unsubForImportTracker = onAnyModuleInitialized(({ exports }, id) => {
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
