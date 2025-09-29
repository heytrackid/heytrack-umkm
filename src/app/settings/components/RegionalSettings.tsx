'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'

interface RegionalSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Regional settings component for currency and timezone
 */
export function RegionalSettings({ settings, onSettingChange }: RegionalSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pengaturan Regional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Mata Uang</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={settings.general.currency}
              onChange={(e) => onSettingChange('general', 'currency', e.target.value)}
            >
              <option value="IDR">Indonesian Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="timezone">Zona Waktu</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={settings.general.timezone}
              onChange={(e) => onSettingChange('general', 'timezone', e.target.value)}
            >
              <option value="Asia/Jakarta">Jakarta (UTC+7)</option>
              <option value="Asia/Makassar">Makassar (UTC+8)</option>
              <option value="Asia/Jayapura">Jayapura (UTC+9)</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
