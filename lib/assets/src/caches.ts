// TODO(lib/assets): do not depend on Discord's ClientInfoModule for versioning, use native interop
import { ClientInfoModule } from '@revenge-mod/discord/native'
import { getStorage } from '@revenge-mod/storage'
// import { debounce } from '@revenge-mod/utils/callbacks'
import { createLogger } from '@revenge-mod/utils/logger'
import { mergeDeep } from '@revenge-mod/utils/objects'
import { proxify } from '@revenge-mod/utils/proxy'
import type { Metro } from '@revenge-mod/modules/types'
import type { Asset } from './types'

const logger = createLogger('revenge.assets.caches')

const Version = 1
const CurrentKey = `${Version}.${ClientInfoModule.Build}`

const CacheStorage = getStorage<Cache>('revenge/assets', {
    default: { k: CurrentKey, c: {} },
    directory: 'cache',
})

export const cache: Cache['c'] = proxify(
    () => {
        if (CacheStorage.cache) return CacheStorage.cache.c
    },
    { hint: 'object' },
)!

// biome-ignore lint/complexity/useArrowFunction: Arrow functions are not supported
CacheStorage.get().then(async function (cache) {
    // TODO(lib/assets/caches): This loads way too late and requires native interop to load earlier
    logger.log(`Loaded cache version: ${cache.k}`)
    if (cache.k !== CurrentKey) {
        await CacheStorage.delete()
        await CacheStorage.set({ k: CurrentKey, c: {} })
    }
})

export interface Cache {
    k: string
    c: {
        [key: Asset['name']]: {
            [key: Asset['type']]: Metro.ModuleID
        }
    }
}

// const save = debounce(() => CacheStorage.set({}), 1000)

export async function cacheAsset(asset: Asset, moduleId: Metro.ModuleID) {
    // Merge directly into the cache, only debouncing actual writes
    mergeDeep(CacheStorage.cache!.c, {
        [asset.name]: {
            [asset.type]: moduleId,
        },
    })

    // Commented out because caching currently does not work properly because it is loaded too late
    // await save()
}
