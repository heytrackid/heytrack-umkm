'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Currency {
  code: string
  symbol: string
  name: string
  decimals: number
}

interface Language {
  code: string
  name: string
  flag: string
}

interface Settings {
  currency: Currency
  language: Language
}

interface SettingsContextType {
  settings: Settings
  currencies: Currency[]
  updateCurrency: (currency: Currency) => void
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

const defaultSettings: Settings = {
  currency: currencies[0], // IDR as default
  language: { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('heytrack-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        // Force IDR if no currency is set or invalid currency
        if (!parsed.currency || !parsed.currency.code) {
          parsed.currency = currencies[0] // IDR
        }
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error: any) {
        console.error('Failed to parse saved settings:', error)
        // Reset to default on error
        setSettings(defaultSettings)
        localStorage.setItem('heytrack-settings', JSON.stringify(defaultSettings))
      }
    } else {
      // First time user - set default IDR
      localStorage.setItem('heytrack-settings', JSON.stringify(defaultSettings))
    }
  }, [])

  const updateCurrency = (currency: Currency) => {
    const newSettings = { ...settings, currency }
    setSettings(newSettings)
    localStorage.setItem('heytrack-settings', JSON.stringify(newSettings))
  }

  const formatCurrency = (amount: number | null | undefined): string => {
    const { symbol, decimals } = settings.currency
    // Handle null, undefined, or invalid numbers
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
      updateCurrency,
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
