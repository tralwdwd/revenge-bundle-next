import { byProps } from '../finders/filters'
import { waitForModules } from '../finders/wait'
import { mImportedPaths, mInitializingId } from './_internal'
import { executeImportedPathSubscriptions } from './subscriptions/_internal'

const unsubFFI = waitForModules(byProps('fileFinishedImporting'), exports => {
    unsubFFI()

    const orig = exports.fileFinishedImporting
    exports.fileFinishedImporting = (path: string) => {
        orig(path)
        const id = mInitializingId!
        mImportedPaths.set(path, id)
        executeImportedPathSubscriptions(id, path)
    }
})
