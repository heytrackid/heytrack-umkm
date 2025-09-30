'use client'

import { Button } from '@/components/ui/button'

export default function LanguageToggle() {
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
