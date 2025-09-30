'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function LanguageToggle() {
  const [lang, setLang] = useState<'id' | 'en'>('id')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('heytrack-lang') as 'id' | 'en' | null
      if (saved === 'id' || saved === 'en') {
        setLang(saved)
      }
    } catch {}
  }, [])

  const next = lang === 'id' ? 'en' : 'id'

  const handleClick = () => {
    const newLang = next
    try {
      localStorage.setItem('heytrack-lang', newLang)
    } catch {}
    setLang(newLang)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="px-2"
      aria-label="Toggle language"
      onClick={handleClick}
      title={next === 'id' ? 'Switch to Indonesian' : 'Switch to English'}
    >
      {lang.toUpperCase()}
    </Button>
  )
}
