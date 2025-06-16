import { _emitter } from '@revenge-mod/plugins/_'
import { PluginsStorageDirectory } from '@revenge-mod/plugins/constants'
import { defineLazyProperty } from '@revenge-mod/utils/objects'
import { getStorage } from '.'

_emitter.on('init', ({ _s: storageOptions, manifest: { id } }, api) =>
    defineLazyProperty(api, 'storage', () =>
        getStorage(`${PluginsStorageDirectory}/${id}.json`, {
            ...storageOptions,
            directory: 'documents',
        }),
    ),
)
