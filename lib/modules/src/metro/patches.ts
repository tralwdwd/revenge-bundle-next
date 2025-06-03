import { byProps } from '../finders/filters'
import { waitForModules } from '../finders/wait'
import { _initing, _paths } from './_internal'
import { _execPathSubs } from './subscriptions/_internal'

const unsubFFI = waitForModules(byProps('fileFinishedImporting'), exports => {
    unsubFFI()

    const orig = exports.fileFinishedImporting
    exports.fileFinishedImporting = (path: string) => {
        orig(path)
        const id = _initing
        _paths.set(path, id)
        _execPathSubs(id, path)
    }
})
