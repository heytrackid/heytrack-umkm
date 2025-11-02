import type { Settings as SettingsContextState } from '@/contexts/settings-context'


export type ThemeOption = 'light' | 'dark' | 'system'
export type TimeFormatOption = '24h' | '12h'
export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
export type LanguageOption = 'id' | 'en'

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

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  lowStockAlert: boolean
  orderUpdates: boolean
  dailyReports: boolean
  weeklyReports: boolean
  monthlyReports: boolean
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
  notifications: NotificationSettings
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
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlert: true,
    orderUpdates: true,
    dailyReports: true,
    weeklyReports: false,
    monthlyReports: true,
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
  const merged: Partial<AppSettingsState> = settings || {}

  const general: GeneralSettings = {
    ...DEFAULT_APP_SETTINGS.general,
    ...(merged.general || {}),
  }

  const user: UserSettings = {
    ...DEFAULT_APP_SETTINGS.user,
    ...(merged.user || {}),
  }

  const notifications: NotificationSettings = {
    ...DEFAULT_APP_SETTINGS.notifications,
    ...(merged.notifications || {}),
  }

  const systemSource: Partial<SystemSettings> = merged.system || {}
  const parsedDefaultTax = Number(systemSource.defaultTax)
  const parsedLowStock = Number(systemSource.lowStockThreshold)

  const system: SystemSettings = {
    ...DEFAULT_APP_SETTINGS.system,
    ...systemSource,
    defaultTax: Number.isFinite(parsedDefaultTax) ? parsedDefaultTax : DEFAULT_APP_SETTINGS.system.defaultTax,
    lowStockThreshold: Number.isFinite(parsedLowStock) ? parsedLowStock : DEFAULT_APP_SETTINGS.system.lowStockThreshold,
  }

  const uiSource: Partial<UISettings> = merged.ui || {}
  const ui: UISettings = {
    ...DEFAULT_APP_SETTINGS.ui,
    ...uiSource,
    language: (uiSource.language) || DEFAULT_APP_SETTINGS.ui.language,
    theme: (uiSource.theme) || DEFAULT_APP_SETTINGS.ui.theme,
    dateFormat: (uiSource.dateFormat) || DEFAULT_APP_SETTINGS.ui.dateFormat,
    timeFormat: (uiSource.timeFormat) || DEFAULT_APP_SETTINGS.ui.timeFormat,
  }

  if (contextSettings) {
    general.currency = contextSettings.currency.code
    ui.currency = contextSettings.currency.code
  }

  return {
    general,
    user,
    notifications,
    system,
    ui,
  }
}
