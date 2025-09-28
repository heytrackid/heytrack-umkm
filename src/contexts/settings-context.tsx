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
  updateCurrency: (currency: Currency) => void
  updateLanguage: (language: Language) => void
  formatCurrency: (amount: number) => string
  t: (key: string) => string
}

const currencies: Currency[] = [
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

const languages: Language[] = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

const translations = {
  id: {
    // Navigation
    'dashboard': 'Dashboard',
    'ai_hub': 'AI Hub',
    'inventory': 'Bahan Baku',
    'operational_costs': 'Biaya Operasional',
    'production': 'Resep Produk',
    'hpp_calculator': 'HPP Calculator',
    'pricing': 'Target Harga',
    'orders': 'Kelola Pesanan',
    'customers': 'Data Pelanggan',
    'reports': 'Laporan Profit',
    'review': 'Review HPP',
    'settings': 'Pengaturan',
    'categories': 'Kategori Produk',
    
    // Common
    'add': 'Tambah',
    'edit': 'Edit',
    'delete': 'Hapus',
    'save': 'Simpan',
    'cancel': 'Batal',
    'loading': 'Memuat...',
    'refresh': 'Refresh',
    'search': 'Cari',
    'name': 'Nama',
    'description': 'Deskripsi',
    'amount': 'Jumlah',
    'price': 'Harga',
    'quantity': 'Kuantitas',
    'total': 'Total',
    
    // Production
    'recipe_name': 'Nama Resep',
    'category': 'Kategori',
    'ingredients': 'Bahan',
    'add_ingredient': 'Tambah Bahan',
    'auto_add': 'Auto Tambah',
    'manual_add': 'Tambah Manual',
    'manage_categories': 'Kelola Kategori',
    
    // Currency
    'per': 'per',
    'month': 'bulan',
    'daily': 'harian',
    'weekly': 'mingguan',
    'monthly': 'bulanan',
    'yearly': 'tahunan'
  },
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'ai_hub': 'AI Hub',
    'inventory': 'Raw Materials',
    'operational_costs': 'Operational Costs',
    'production': 'Product Recipes',
    'hpp_calculator': 'COGS Calculator',
    'pricing': 'Target Pricing',
    'orders': 'Manage Orders',
    'customers': 'Customer Data',
    'reports': 'Profit Reports',
    'review': 'COGS Review',
    'settings': 'Settings',
    'categories': 'Product Categories',
    
    // Common
    'add': 'Add',
    'edit': 'Edit',
    'delete': 'Delete',
    'save': 'Save',
    'cancel': 'Cancel',
    'loading': 'Loading...',
    'refresh': 'Refresh',
    'search': 'Search',
    'name': 'Name',
    'description': 'Description',
    'amount': 'Amount',
    'price': 'Price',
    'quantity': 'Quantity',
    'total': 'Total',
    
    // Production
    'recipe_name': 'Recipe Name',
    'category': 'Category',
    'ingredients': 'Ingredients',
    'add_ingredient': 'Add Ingredient',
    'auto_add': 'Auto Add',
    'manual_add': 'Manual Add',
    'manage_categories': 'Manage Categories',
    
    // Currency
    'per': 'per',
    'month': 'month',
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly',
    'yearly': 'yearly'
  }
}

const defaultSettings: Settings = {
  currency: currencies[0], // IDR
  language: languages[0]   // Indonesian
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
        setSettings(parsed)
      } catch (error) {
        console.error('Error loading settings:', error)
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

  const formatCurrency = (amount: number): string => {
    const { symbol, decimals } = settings.currency
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return `${symbol} ${formattedAmount}`
  }

  const t = (key: string): string => {
    const langTranslations = translations[settings.language.code as keyof typeof translations]
    return langTranslations?.[key as keyof typeof langTranslations] || key
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateCurrency,
      updateLanguage,
      formatCurrency,
      t
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

export { currencies, languages }