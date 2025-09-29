'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'

interface DateTimeSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Date and time format settings component
 */
export function DateTimeSettings({ settings, onSettingChange }: DateTimeSettingsProps) {
  const { t } = useI18n()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('settings.dateTime.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="dateFormat">{t('settings.dateTime.dateFormat')}</Label>
          <select
            id="dateFormat"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.dateFormat}
            onChange={(e) => onSettingChange('ui', 'dateFormat', e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <Label htmlFor="timeFormat">{t('settings.dateTime.timeFormat')}</Label>
          <select
            id="timeFormat"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.timeFormat}
            onChange={(e) => onSettingChange('ui', 'timeFormat', e.target.value)}
          >
            <option value="24h">{t('settings.dateTime.formats.24h')}</option>
            <option value="12h">{t('settings.dateTime.formats.12h')}</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
