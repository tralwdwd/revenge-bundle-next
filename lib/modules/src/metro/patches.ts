import '@revenge-mod/assets/patches'

import { _mInitingId, _mPaths } from './_internal'

import { _executeImportedPathSubscription } from './subscriptions/_internal'

import { waitForModules } from '../finders'
import { byProps } from '../finders/filters'

const unsubForImportTracker = waitForModules(byProps('fileFinishedImporting'), (_, exports) => {
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
