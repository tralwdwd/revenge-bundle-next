// TODO(lib/modules/caches): do not depend on Discord's ClientInfoModule for versioning, use native interop
import { ClientInfoModule } from '@revenge-mod/discord/native'
import { getStorage } from '@revenge-mod/storage'
import { debounce } from '@revenge-mod/utils/callbacks'
import type { Metro } from '@revenge-mod/modules/types'
import type { FilterResultFlag } from './finders/_internal'
import type { Filter } from './finders/filters'

const Version = 1
const Key = `${Version}.${ClientInfoModule.Build}`

// In-memory cache
export const cache: Cache = {}

const CacheStorage = getStorage<Cache>(`revenge/modules.${Key}`, {
    default: cache,
    directory: 'cache',
})

// TODO(lib/modules/caches): This loads way too late and requires native interop to load earlier
export const cached = CacheStorage.get().then(cache_ => {
    const cached = cache_ !== cache
    // If we are not using the default value, merge it into the in-memory cache, then point the storage cache to the in-memory cache.
    if (cached) {
        Object.assign(cache, cache_)
        CacheStorage.cache = cache
    }

    return cached
})

export interface Cache {
    [key: Filter['key']]:
        | Record<Metro.ModuleID, FilterResultFlag>
        | null
        | undefined
}

const save = debounce(() => CacheStorage.set({}), 1000)

export function cacheFilterResult(
    key: Filter['key'],
    id: Metro.ModuleID,
    flag: FilterResultFlag,
): FilterResultFlag {
    const reg = (cache[key] ??= {})
    reg[id] = flag

    save()

    return flag
}
