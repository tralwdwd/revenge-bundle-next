import { _data, _subs } from './_internal'

import type { ComponentType, ReactNode } from 'react'
import type { DiscordModules } from '../../types'

export type SettingsModulesLoadedSubscription = () => void

/**
 * Checks if the settings modules are loaded.
 */
export function isSettingsModulesLoaded() {
    return _data[2]
}

/**
 * Subscribes to when settings modules are loaded.
 * Plugins should ideally register their settings in the given callback to ensure fast startup time.
 *
 * @param subcription The subscription function to call when the settings modules are loaded.
 * @returns A function to unsubscribe from the event.
 * @throws Throws an error if the settings modules are already loaded. Check with {@link isSettingsModulesLoaded} first.
 */
export function onceSettingsModulesLoaded(subcription: SettingsModulesLoadedSubscription) {
    if (_data[2]) throw new Error('Settings modules already loaded')

    _subs.add(subcription)
    return () => _subs.delete(subcription)
}

/**
 * Registers a settings section with a given key.
 *
 * @param key The key to register the settings section with.
 * @param section The settings section to register.
 * @returns A function to unregister the settings section.
 */
export function registerSettingsSection(key: string, section: SettingsSection) {
    _data[0][key] = section
    return () => delete _data[0][key]
}

/**
 * Registers a settings item with a given key.
 *
 * @param key The key to register the settings item with.
 * @param item The settings item to register.
 * @returns A function to unregister the settings item.
 */
export function registerSettingsItem(key: string, item: SettingsItem) {
    _data[1][key] = item
    return () => delete _data[1][key]
}

/**
 * Registers multiple settings items at once.
 *
 * @param record The settings items to register.
 * @returns A function to unregister the settings items.
 */
export function registerSettingsItems(record: Record<string, SettingsItem>) {
    Object.assign(_data[1], record)
    return () => {
        for (const key in record) delete _data[1][key]
    }
}

/**
 * Adds a settings item to an existing section.
 *
 * @param key The section to add the settings item to.
 * @param item The settings item to add.
 * @returns A function to remove the settings item from the section.
 */
export function addSettingsItemToSection(key: string, item: string) {
    const section = _data[0][key]
    if (!section) throw new Error(`Section "${key}" does not exist`)

    const newLength = section.settings.push(item)
    return () => delete section.settings[newLength - 1]
}

export interface SettingsSection {
    label: string
    settings: string[]
    index?: number
}

interface BaseSettingsItem {
    title: () => string
    parent: string | null
    unsearchable?: boolean
    variant?: DiscordModules.Components.TableRowProps['variant']
    IconComponent?: () => ReactNode
    usePredicate?: () => boolean
    useTrailing?: () => ReactNode
    useDescription?: () => string
    useIsDisabled?: () => boolean
}

export interface PressableSettingsItem extends BaseSettingsItem {
    type: 'pressable'
    onPress?: () => void
}

export interface ToggleSettingsItem extends BaseSettingsItem {
    type: 'toggle'
    useValue: () => boolean
    onValueChange?: (value: boolean) => void
}

export interface RouteSettingsItem extends BaseSettingsItem {
    type: 'route'
    screen: { route: string; getComponent(): ComponentType }
}

export interface StaticSettingsItem extends BaseSettingsItem {
    type: 'static'
}

export type SettingsItem = PressableSettingsItem | ToggleSettingsItem | RouteSettingsItem | StaticSettingsItem
