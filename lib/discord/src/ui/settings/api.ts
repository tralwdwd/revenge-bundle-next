import { _suiData } from './_internal'

import type { ComponentType, ReactNode } from 'react'

export function addSettingsSection(key: string, section: SettingsSection) {
    _suiData.sections[key] = section
    return () => delete _suiData.sections[key]
}

export function addSettingsRow(key: string, row: SettingsRowConfig) {
    _suiData.settings[key] = row
    return () => delete _suiData.settings[key]
}

export function addSettingsRowToSection(sectionKey: string, rowKey: string, row: SettingsRowConfig) {
    if (!_suiData.sections[sectionKey]) throw new Error(`Section "${sectionKey}" does not exist`)
    _suiData.sections[sectionKey].settings[rowKey] = row
    return () => delete _suiData.sections[sectionKey].settings[rowKey]
}

export interface SettingsSection {
    label: string
    settings: Record<string, SettingsRowConfig>
    index?: number
}

interface BaseSettingsRowConfig {
    title: () => string
    parent: string | null
    unsearchable?: boolean
    IconComponent?: () => ReactNode
    usePredicate?: () => boolean
    useTrailing?: () => ReactNode
    useDescription?: () => string
    useIsDisabled?: () => boolean
}

export interface PressableSettingsRowConfig extends BaseSettingsRowConfig {
    type: 'pressable'
    onPress?: () => void
}

export interface ToggleSettingsRowConfig extends BaseSettingsRowConfig {
    type: 'toggle'
    useValue: () => boolean
    onValueChange?: (value: boolean) => void
}

export interface RouteSettingsRowConfig extends BaseSettingsRowConfig {
    type: 'route'
    screen: { route: string; getComponent(): ComponentType }
}

export type SettingsRowConfig = PressableSettingsRowConfig | ToggleSettingsRowConfig | RouteSettingsRowConfig
