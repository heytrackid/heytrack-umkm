'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

import { uiLogger } from '@/lib/logger'



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

const defaultCurrency = currencies.find(c => c['code'] === DEFAULT_CURRENCY_CODE) ?? currencies[0]!
const defaultLanguage = languages.find(l => l['code'] === DEFAULT_LANGUAGE_CODE) ?? languages[0]!

const defaultSettings: Settings = {
  currency: defaultCurrency,
  language: defaultLanguage
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [_isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated to prevent hydration mismatch
    setIsHydrated(true)

    // Load settings from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('heytrack-settings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          const parsedCurrency = currencies.find(c => c.code === parsed?.currency?.code) ?? defaultCurrency
          const parsedLanguage = languages.find(l => l.code === parsed?.language?.code) ?? defaultLanguage
          const newSettings: Settings = {
            currency: parsedCurrency,
            language: parsedLanguage
          }
          setSettings(newSettings)
          localStorage.setItem('heytrack-settings', JSON.stringify(newSettings))
        } catch (error) {
          uiLogger.error({ error }, 'Failed to parse saved settings from localStorage')
          setSettings(defaultSettings)
          localStorage.setItem('heytrack-settings', JSON.stringify(defaultSettings))
        }
      } else {
        setSettings(defaultSettings)
        localStorage.setItem('heytrack-settings', JSON.stringify(defaultSettings))
      }
    }
  }, [])

  const updateCurrency = (currency: Currency) => {
    const newSettings = { ...settings, currency }
    setSettings(newSettings)
    localStorage.setItem('heytrack-settings', JSON.stringify(newSettings))
  }

  const updateLanguage = (language: Language) => {
    const newSettings = { ...settings, language }
    setSettings(newSettings)
    localStorage.setItem('heytrack-settings', JSON.stringify(newSettings))
  }

  const formatCurrency = (amount: number | null | undefined): string => {
    const { symbol, decimals } = settings.currency
    const validAmount = amount ?? 0
    const formattedAmount = validAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return `${symbol} ${formattedAmount}`
  }

  const resetToDefault = () => {
    setSettings(defaultSettings)
    localStorage.setItem('heytrack-settings', JSON.stringify(defaultSettings))
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      currencies,
      languages,
      updateCurrency,
      updateLanguage,
      formatCurrency,
      resetToDefault
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
