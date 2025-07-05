import type { Metro } from '../../types'
import type {
    ModuleFinishedImportingCallback,
    ModuleFirstRequiredCallback,
    ModuleInitializedCallback,
} from '.'

export const sRequireAny = new Set<ModuleFirstRequiredCallback>()
export const sRequire = new Map<
    Metro.ModuleID,
    Set<ModuleFirstRequiredCallback>
>()
export const sInitializeAny = new Set<ModuleInitializedCallback>()
export const sInitialize = new Map<
    Metro.ModuleID,
    Set<ModuleInitializedCallback>
>()
export const sImportedPath = new Set<ModuleFinishedImportingCallback>()

export function executeRequireSubscriptions(id: Metro.ModuleID) {
    for (const cb of sRequireAny) cb(id)
    if (sRequire.has(id)) {
        for (const cb of sRequire.get(id)!) cb(id)
        sRequire.delete(id)
    }
}

export function executeInitializeSubscriptions(
    id: Metro.ModuleID,
    exports: Metro.ModuleExports,
) {
    for (const cb of sInitializeAny) cb(id, exports)
    if (sInitialize.has(id)) {
        for (const cb of sInitialize.get(id)!) cb(id, exports)
        sInitialize.delete(id)
    }
}

export function executeImportedPathSubscriptions(
    id: Metro.ModuleID,
    path: string,
) {
    for (const cb of sImportedPath) cb(id, path)
}
