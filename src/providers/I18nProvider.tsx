'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import id from '@/i18n/id.json'
import en from '@/i18n/en.json'

export type Locale = 'id' | 'en'

type Messages = Record<string, string | Messages>

interface I18nContextValue {
  locale: Locale
  setLocale: (loc: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18N_STORAGE_KEY = 'heytrack.locale'

const dictionaries: Record<Locale, Messages> = {
  id: id as Messages,
  en: en as Messages,
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(I18N_STORAGE_KEY) as Locale | null
      if (saved === 'id' || saved === 'en') setLocaleState(saved)
    } catch {}
  }, [])

  const setLocale = (loc: Locale) => {
    setLocaleState(loc)
    try { localStorage.setItem(I18N_STORAGE_KEY, loc) } catch {}
  }

  const t = useMemo(() => {
    const translate = (key: string, vars?: Record<string, string | number>) => {
      const parts = key.split('.')
      let node: any = dictionaries[locale]
      for (const p of parts) {
        node = node?.[p]
        if (node == null) break
      }
      let result = typeof node === 'string' ? node : key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        })
      }
      return result
    }
    return translate
  }, [locale])

  const value: I18nContextValue = { locale, setLocale, t }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
