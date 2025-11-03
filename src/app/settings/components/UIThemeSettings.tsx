'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Palette } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'
import type {
  AppSettingsState,
  SettingsUpdateHandler,
  ThemeOption,
  LanguageOption,
} from '@/app/settings/types'

interface UIThemeSettingsProps {
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

/**
 * UI theme settings component
 */
export const UIThemeSettings = ({ settings, onSettingChange }: UIThemeSettingsProps) => {
  const { languages, updateLanguage } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tampilan & Bahasa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme">Tema</Label>
          <select
            id="theme"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.theme}
            onChange={(e) =>
              onSettingChange('ui', 'theme', e.target.value as ThemeOption)
            }
          >
            <option value="light">Terang</option>
            <option value="dark">Gelap</option>
            <option value="system">Sistem</option>
          </select>
        </div>
        <div>
          <Label htmlFor="language">Bahasa</Label>
          <select
            id="language"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.language}
            onChange={(e) => {
              const selected = languages.find(l => l.code === e.target.value)
              if (selected) {
                void updateLanguage(selected)
                onSettingChange('ui', 'language', selected.code as LanguageOption)
              }
            }}
          >
            {languages.map(language => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-1">
            Perubahan bahasa memengaruhi teks antarmuka aplikasi.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
