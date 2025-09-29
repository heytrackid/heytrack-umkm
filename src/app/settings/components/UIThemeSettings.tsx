'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Palette } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'

interface UIThemeSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * UI theme settings component
 */
export function UIThemeSettings({ settings, onSettingChange }: UIThemeSettingsProps) {
  const { updateLanguage } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tampilan & Tema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme">Tema</Label>
          <select
            id="theme"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.theme}
            onChange={(e) => onSettingChange('ui', 'theme', e.target.value)}
          >
            <option value="light">Terang</option>
            <option value="dark">Gelap</option>
            <option value="system">Mengikuti Sistem</option>
          </select>
        </div>
        <div>
          <Label htmlFor="language">Bahasa</Label>
          <select
            id="language"
            className="w-full p-2 border border-input rounded-md bg-background"
            value="id"
            onChange={(e) => {
              const selectedLanguage = { code: e.target.value, name: 'Indonesian', flag: '🇮🇩' }
              updateLanguage(selectedLanguage)
            }}
          >
            <option value="id">🇮🇩 Indonesian</option>
            <option value="en">🇺🇸 English</option>
          </select>
          <p className="text-sm text-muted-foreground mt-1">
            Bahasa akan berubah setelah refresh halaman
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
