'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Palette } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'
import { useI18n } from '@/providers/I18nProvider'

interface UIThemeSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * UI theme settings component
 */
export function UIThemeSettings({ settings, onSettingChange }: UIThemeSettingsProps) {
  const { updateLanguage } = useSettings()
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t('settings.uiTheme.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme">{t('settings.uiTheme.theme')}</Label>
          <select
            id="theme"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.theme}
            onChange={(e) => onSettingChange('ui', 'theme', e.target.value)}
          >
            <option value="light">{t('settings.uiTheme.themes.light')}</option>
            <option value="dark">{t('settings.uiTheme.themes.dark')}</option>
            <option value="system">{t('settings.uiTheme.themes.system')}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="language">{t('settings.uiTheme.language')}</Label>
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
            {t('settings.uiTheme.languageNote')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
