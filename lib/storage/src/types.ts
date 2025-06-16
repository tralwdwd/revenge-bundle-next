import type {
    PluginApiExtensionsOptions,
    PluginManifest,
    PluginOptions,
} from '@revenge-mod/plugins/types'
import type { AnyObject } from '@revenge-mod/utils/types'
import type { Storage, StorageOptions } from '.'

declare module '@revenge-mod/plugins/types' {
    export interface PluginApiExtensionsOptions {
        storage: AnyObject
    }

    export interface PluginOptions<O extends PluginApiExtensionsOptions> {
        storage?: Omit<StorageOptions<O['storage']>, 'directory'>
    }

    export interface InitPluginApi<O extends PluginApiExtensionsOptions> {
        /**
         * The plugin storage.
         *
         * Note that the instance is only created when the plugin accesses the API.
         * This is to prevent unnecessary storage instances from being created.
         *
         * To preload storage, simply call `api.storage.get()`.
         */
        storage: Storage<O['storage']>
    }
}

declare module '@revenge-mod/plugins/_' {
    export function registerPlugin<E extends PluginApiExtensionsOptions>(
        manifest: PluginManifest,
        options: PluginOptions<E>,
        flags: number,
        iflags: number,
    ): void

    export interface InternalPlugin {
        _s?: StorageOptions<AnyObject>
    }
}
