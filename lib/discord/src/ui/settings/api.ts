import { _suiData } from './_internal'

import type { DiscordModules } from '../../../types'
import type { ComponentType, ReactNode } from 'react'

export function registerSettingsSection(key: string, section: SettingsSection) {
    _suiData.sections[key] = section
    return () => delete _suiData.sections[key]
}

export function registerSettingsItem(key: string, row: SettingsItem) {
    _suiData.config[key] = row
    return () => delete _suiData.config[key]
}

export function addSettingsItemToSection(section: string, row: string) {
    if (!_suiData.sections[section]) throw new Error(`Section "${section}" does not exist`)
    const newLength = _suiData.sections[section].settings.push(row)

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
