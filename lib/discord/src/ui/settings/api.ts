import { _suiData } from './_internal'

import type { DiscordModules } from '../../../types'
import type { ComponentType, ReactNode } from 'react'

export function registerSettingsSection(key: string, section: SettingsSection) {
    _suiData.sections[key] = section
    return () => delete _suiData.sections[key]
}

export function registerSetting(key: string, row: SettingsRowConfig) {
    _suiData.config[key] = row
    return () => delete _suiData.config[key]
}

export function addSettingToSection(section: string, row: string) {
    if (!_suiData.sections[section]) throw new Error(`Section "${section}" does not exist`)
    const newLength = _suiData.sections[section].settings.push(row)

    return () => delete _suiData.sections[section].settings[newLength - 1]
}

export interface SettingsSection {
    label: string
    settings: string[]
    index?: number
}

interface BaseSettingsRowConfig {
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
