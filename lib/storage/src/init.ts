import { pEmitter } from '@revenge-mod/plugins/_'
import { PluginsStorageDirectory } from '@revenge-mod/plugins/constants'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import { getStorage } from '.'

pEmitter.on('init', ({ _s: storageOptions, manifest: { id } }, api) =>
    defineLazyProperty(api, 'storage', () =>
        getStorage(`${PluginsStorageDirectory}/${id}.json`, {
            ...storageOptions,
            directory: 'documents',
        }),
    ),
)
