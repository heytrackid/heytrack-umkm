'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import type {
  AppSettingsState,
  SettingsUpdateHandler,
  DateFormatOption,
  TimeFormatOption,
} from '@/app/settings/types'

interface DateTimeSettingsProps {
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

/**
 * Date and time format settings component
 */
export const DateTimeSettings = ({ settings, onSettingChange }: DateTimeSettingsProps) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Format Tanggal & Waktu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="dateFormat">Format Tanggal</Label>
          <select
            id="dateFormat"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.dateFormat}
            onChange={(e) =>
              onSettingChange('ui', 'dateFormat', e.target.value as DateFormatOption)
            }
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <Label htmlFor="timeFormat">Format Waktu</Label>
          <select
            id="timeFormat"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.timeFormat}
            onChange={(e) =>
              onSettingChange('ui', 'timeFormat', e.target.value as TimeFormatOption)
            }
          >
            <option value="24h">24 jam</option>
            <option value="12h">12 jam</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
