'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/providers/I18nProvider'

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  const next = locale === 'id' ? 'en' : 'id'
  return (
    <Button
      variant="ghost"
      size="sm"
      className="px-2"
      aria-label="Toggle language"
      onClick={() => setLocale(next)}
      title={next === 'id' ? 'Switch to Indonesian' : 'Switch to English'}
    >
      {locale.toUpperCase()}
    </Button>
  )
}
