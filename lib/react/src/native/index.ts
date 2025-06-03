import { _ara, _bra } from './patches'

/**
 * Registers a callback to be run when a call to {@link AppRegistry.runApplication} is made.
 *
 * @param callback The callback to be called.
 * @returns A function to unregister the callback.
 */
export function onRunApplication(callback: RunApplicationCallback) {
    _bra.add(callback)
    return () => _bra.delete(callback)
}

/**
 * Registers a callback to be run when a call to {@link AppRegistry.runApplication} is finished.
 *
 * @param callback The callback to be called.
 * @returns A function to unregister the callback.
 */
export function onRunApplicationFinished(callback: RunApplicationCallback) {
    _ara.add(callback)
    return () => _ara.delete(callback)
}

export type RunApplicationCallback = () => any
