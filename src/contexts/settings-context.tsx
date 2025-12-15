'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'



export interface Currency {
  code: string
  symbol: string
  name: string
  decimals: number
}

export interface Language {
  code: string
  name: string
  flag: string
}

export interface Settings {
  currency: Currency
  language: Language
}

interface SettingsContextType {
  settings: Settings
  currencies: Currency[]
  languages: Language[]
  updateCurrency: (currency: Currency) => void
  updateLanguage: (language: Language) => void
  formatCurrency: (amount: number) => string
  formatCompactCurrency: (amount: number) => string
  resetToDefault: () => void
}

export const currencies: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2 }
]

export const languages: Language[] = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

const DEFAULT_CURRENCY_CODE = process['env']['NEXT_PUBLIC_DEFAULT_CURRENCY'] ?? 'IDR'
const DEFAULT_LANGUAGE_CODE = process['env']['NEXT_PUBLIC_DEFAULT_LANGUAGE'] ?? 'id'

const defaultCurrency = currencies.find(c => c['code'] === DEFAULT_CURRENCY_CODE) ?? currencies[0] as Currency
const defaultLanguage = languages.find(l => l['code'] === DEFAULT_LANGUAGE_CODE) ?? languages[0] as Language

const defaultSettings: Settings = {
  currency: defaultCurrency,
  language: defaultLanguage
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const SettingsProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') {
      return defaultSettings
    }
    try {
      const stored = localStorage.getItem('heytrack-settings')
      if (stored) {
        return JSON.parse(stored) as Settings
      }
    } catch {
      // ignore corrupted data
    }
    return defaultSettings
  })

  // Settings are loaded in useState initializer

  const persistSettings = useCallback((updater: (prev: Settings) => Settings) => {
    setSettings(prev => {
      const next = updater(prev)
      if (typeof window !== 'undefined') {
        localStorage.setItem('heytrack-settings', JSON.stringify(next))
      }
      return next
    })
  }, [])

  const updateCurrency = useCallback((currency: Currency): void => {
    persistSettings(prev => ({ ...prev, currency }))
  }, [persistSettings])

  const updateLanguage = useCallback((language: Language): void => {
    persistSettings(prev => ({ ...prev, language }))
  }, [persistSettings])

  const formatCurrency = (amount: number | null | undefined): string => {
    const { symbol, decimals, code } = settings.currency
    const validAmount = amount ?? 0
    // Use id-ID locale for IDR (titik as thousands separator)
    const locale = code === 'IDR' ? 'id-ID' : 'en-US'
    const formattedAmount = validAmount.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return `${symbol} ${formattedAmount}`
  }

  // Format compact currency for mobile/small spaces (rb, jt, M for IDR)
  const formatCompactCurrency = (amount: number | null | undefined): string => {
    const { symbol, code } = settings.currency
    const validAmount = amount ?? 0
    
    if (code === 'IDR') {
      // Indonesian format: rb (ribu), jt (juta), M (miliar)
      if (validAmount >= 1_000_000_000) {
        return `${symbol} ${(validAmount / 1_000_000_000).toFixed(1).replace('.', ',')}M`
      }
      if (validAmount >= 1_000_000) {
        return `${symbol} ${(validAmount / 1_000_000).toFixed(1).replace('.', ',')}jt`
      }
      if (validAmount >= 1_000) {
        return `${symbol} ${Math.round(validAmount / 1_000)}rb`
      }
      return `${symbol} ${validAmount.toLocaleString('id-ID')}`
    }
    
    // Other currencies: K, M, B
    if (validAmount >= 1_000_000_000) {
      return `${symbol}${(validAmount / 1_000_000_000).toFixed(1)}B`
    }
    if (validAmount >= 1_000_000) {
      return `${symbol}${(validAmount / 1_000_000).toFixed(1)}M`
    }
    if (validAmount >= 1_000) {
      return `${symbol}${(validAmount / 1_000).toFixed(1)}K`
    }
    return `${symbol}${validAmount}`
  }

  const resetToDefault = useCallback((): void => {
    persistSettings(() => defaultSettings)
  }, [persistSettings])

  return (
    <SettingsContext.Provider value={{
      settings,
      currencies,
      languages,
      updateCurrency,
      updateLanguage,
      formatCurrency,
      formatCompactCurrency,
      resetToDefault
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export { SettingsProvider, useSettings }

