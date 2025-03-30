import { _instances, _targets } from '../../init/src/patches/proxy'

/**
 * Returns whether the object is a proxy
 * @param obj The object to check
 */
export function isProxy(obj: object) {
    return _instances.has(obj)
}

export function getProxyTarget(obj: object) {
    return _targets.get(obj)
}
