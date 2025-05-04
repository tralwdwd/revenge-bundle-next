import { _suiData } from './_internal'

import type { DiscordModules } from '../../../types'
import type { ComponentType, ReactNode } from 'react'

/**
 * Registers a settings section with a given key.
 *
 * @param key The key to register the settings section with.
 * @param section The settings section to register.
 * @returns A function to unregister the settings section.
 */
export function registerSettingsSection(key: string, section: SettingsSection) {
    _suiData.sections[key] = section
    return () => delete _suiData.sections[key]
}

/**
 * Registers a settings item with a given key.
 *
 * @param key The key to register the settings item with.
 * @param item The settings item to register.
 * @returns A function to unregister the settings item.
 */
export function registerSettingsItem(key: string, item: SettingsItem) {
    _suiData.config[key] = item
    return () => delete _suiData.config[key]
}

/**
 * Registers multiple settings items at once.
 *
 * @param record The settings items to register.
 * @returns A function to unregister the settings items.
 */
export function registerSettingsItems(record: Record<string, SettingsItem>) {
    Object.assign(_suiData.config, record)
    return () => {
        for (const key in record) delete _suiData.config[key]
    }
}

/**
 * Adds a settings item to an existing section.
 *
 * @param section The section to add the settings item to.
 * @param item The settings item to add.
 * @returns A function to remove the settings item from the section.
 */
export function addSettingsItemToSection(section: string, item: string) {
    if (!_suiData.sections[section]) throw new Error(`Section "${section}" does not exist`)
    const newLength = _suiData.sections[section].settings.push(item)

    return () => delete _suiData.sections[section].settings[newLength - 1]
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

export type SettingsItem = PressableSettingsItem | ToggleSettingsItem | RouteSettingsItem
