// TODO(storage): Implement using NativeModules interop instead

import { FileModule } from '@revenge-mod/discord/native'
// This file is usually imported way too early, so we can't import our shim
import { React } from '@revenge-mod/react'
import { mergeDeep } from '@revenge-mod/utils/objects'
import { useReRender } from '@revenge-mod/utils/react'
import type { AnyObject, DeepPartial } from '@revenge-mod/utils/types'

/**
 * Get a storage object for a given path and directory.
 *
 * @param path Path relative to the directory.
 * @param directory Directory to use. Can be either 'cache' or 'documents'.
 */
export function getStorage<T extends AnyObject = AnyObject>(
    path: string,
    options?: StorageOptions<T>,
): Storage<T> {
    const { CacheDirPath, DocumentsDirPath } = FileModule.getConstants()

    const directory = options?.directory ?? 'documents'
    const dirPath = directory === 'cache' ? CacheDirPath : DocumentsDirPath
    const fullPath = `${dirPath}/${path}`

    type Subscription = (v: DeepPartial<T>) => void
    const subs = new Set<Subscription>()

    const storage: Storage<T> = {
        loaded: false,
        cache: options?.default,
        use(filter) {
            if (!this.cache) this.get()

            const reRender = useReRender()

            React.useEffect(() => {
                const sub = (
                    filter
                        ? v => {
                              if (filter(v)) reRender()
                          }
                        : reRender
                ) as Subscription

                subs.add(sub)

                return () => {
                    subs.delete(sub)
                }
            }, [])

            return this.cache
        },
        exists() {
            return FileModule.fileExists(fullPath)
        },
        delete() {
            return FileModule.removeFile(directory, path)
        },
        async get() {
            if (!(await this.exists())) {
                this.cache = options?.default ?? {}
                await this.set({})
                this.loaded = true
                return this.cache
            }

            const contents = await FileModule.readFile(fullPath, 'utf8')
            if (contents) {
                this.loaded = true
                try {
                    const cache = (this.cache = JSON.parse(contents))
                    for (const sub of subs) sub(cache)
                    return cache
                } catch (e) {
                    console.error(
                        'Failed to parse storage file (most likely corrupted)',
                        directory,
                        path,
                        e,
                    )
                }
            }
        },
        async set(value) {
            if (!this.cache) await this.get()
            mergeDeep(this.cache!, value)

            try {
                const contents = JSON.stringify(this.cache)
                await FileModule.writeFile(directory, path, contents, 'utf8')

                for (const sub of subs) sub(value)
            } catch (e) {
                console.error(
                    'Failed to write storage file',
                    directory,
                    path,
                    e,
                )
            }
        },
    }

    if (options?.load) storage.get()

    return storage
}

export interface StorageOptions<T> {
    /**
     * The directory of the storage file.
     */
    directory?: StorageDirectory
    /**
     * The default value to use for the storage. This will also be used for cache.
     */
    default?: T
    /**
     * Automatically load the storage after creating the instance.
     */
    load?: boolean
}

export type UseStorageFilter<T extends AnyObject> = (
    newValue: DeepPartial<T>,
) => any

export interface Storage<T extends AnyObject> {
    /**
     * Whether the storage has been loaded. If the storage is not loaded, `storage.cache` may be `undefined`.
     * If you have `options.default` set, you can use this property to check if `storage.cache` is the default value or not.
     */
    loaded: boolean
    /**
     * The cached storage object. Set once `get()` is called, or `options.default` is set, and updated on `set()`.
     * You should not modify this directly.
     */
    cache?: T | AnyObject
    /**
     * Use the storage in a React component. The component will re-render when the storage is updated.
     *
     * @example
     * ```tsx
     * type Settings = { key: boolean, nested: { key: boolean } }
     *
     * const SettingsStorage = getStorage<Settings>('settings.json')
     *
     * const MyComponent = () => {
     *   // Re-renders every time any of the keys in the settings object change
     *   const settings = SettingsStorage.use()
     *   // const settings: Settings | undefined
     *
     *   // ...
     * }
     *
     * const MyComponent2 = () => {
     *  // Re-renders every time the new value matches the filter
     *  const settings = SettingsStorage.use(val => val.key !== undefined)
     *  // const settings: Settings | undefined
     *
     *  // ...
     * }
     */

    use(filter?: UseStorageFilter<T>): T | undefined
    /**
     * Get the storage.
     */
    get(): Promise<T>
    /**
     * Set the storage.
     *
     * @param value The value to merge into the storage.
     */
    set(value: DeepPartial<T>): Promise<void>
    /**
     * Whether the storage is exists.
     */
    exists(): Promise<boolean>
    /**
     * Delete the storage.
     */
    delete(): Promise<boolean>
}

export type StorageDirectory = 'cache' | 'documents'
