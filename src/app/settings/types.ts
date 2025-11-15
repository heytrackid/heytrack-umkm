import type { Settings as SettingsContextState } from '@/contexts/settings-context'


export type ThemeOption = 'dark' | 'light' | 'system'
export type TimeFormatOption = '12h' | '24h'
export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
export type LanguageOption = 'en' | 'id'

export interface GeneralSettings {
  businessName: string
  businessType: string
  address: string
  phone: string
  email: string
  website: string
  description: string
  taxNumber: string
  currency: string
  timezone: string
}

export interface UserSettings {
  fullName: string
  email: string
  phone: string
  role: string
  avatar: string | null
}



export interface SystemSettings {
  defaultTax: number
  lowStockThreshold: number
}

export interface UISettings {
  theme: ThemeOption
  language: LanguageOption
  dateFormat: DateFormatOption
  timeFormat: TimeFormatOption
  currency: string
  numberFormat: string
}

export interface AppSettingsState {
  general: GeneralSettings
  user: UserSettings
  system: SystemSettings
  ui: UISettings
}

export type SettingsCategory = keyof AppSettingsState

export type SettingsSlice<K extends SettingsCategory> = Pick<AppSettingsState, K>

export type SettingsUpdateHandler = (
  category: SettingsCategory,
  key: string,
  value: unknown
) => void

export const DEFAULT_APP_SETTINGS: AppSettingsState = {
  general: {
    businessName: '',
    businessType: 'UMKM',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    taxNumber: '',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
  },
  user: {
    fullName: '',
    email: '',
    phone: '',
    role: 'Owner',
    avatar: null,
  },

  system: {
    defaultTax: 11,
    lowStockThreshold: 10,
  },
  ui: {
    theme: 'system',
    language: 'id',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'IDR',
    numberFormat: '1.234.567,89',
  },
}

export const normalizeSettings = (
  settings: Partial<AppSettingsState> | null | undefined,
  contextSettings?: SettingsContextState
): AppSettingsState => {
  const merged: Partial<AppSettingsState> = settings ?? {}

  const general: GeneralSettings = {
    ...DEFAULT_APP_SETTINGS.general,
    ...(merged.general ?? {}),
  }

  const user: UserSettings = {
    ...DEFAULT_APP_SETTINGS.user,
    ...(merged.user ?? {}),
  }



  const systemSource: Partial<SystemSettings> = merged.system ?? {}
  const parsedDefaultTax = Number(systemSource.defaultTax)
  const parsedLowStock = Number(systemSource.lowStockThreshold)

  const system: SystemSettings = {
    ...DEFAULT_APP_SETTINGS.system,
    ...systemSource,
    defaultTax: Number.isFinite(parsedDefaultTax) ? parsedDefaultTax : DEFAULT_APP_SETTINGS.system.defaultTax,
    lowStockThreshold: Number.isFinite(parsedLowStock) ? parsedLowStock : DEFAULT_APP_SETTINGS.system.lowStockThreshold,
  }

  const uiSource: Partial<UISettings> = merged.ui ?? {}
  const ui: UISettings = {
    ...DEFAULT_APP_SETTINGS.ui,
    ...uiSource,
    language: (uiSource.language) ?? DEFAULT_APP_SETTINGS.ui.language,
    theme: (uiSource.theme) ?? DEFAULT_APP_SETTINGS.ui.theme,
    dateFormat: (uiSource.dateFormat) ?? DEFAULT_APP_SETTINGS.ui.dateFormat,
    timeFormat: (uiSource.timeFormat) ?? DEFAULT_APP_SETTINGS.ui.timeFormat,
  }

  if (contextSettings) {
    general.currency = contextSettings.currency['code']
    ui.currency = contextSettings.currency['code']
  }

  return {
    general,
    user,
    system,
    ui,
  }
}
