'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/settings-context'
import { Settings, RotateCcw } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

interface RegionalSettings {
  timezone?: string
  language?: string
  currency?: string
  region?: string
  [key: string]: unknown
}

interface GeneralSettings {
  regional?: RegionalSettings
  [key: string]: unknown
}

interface RegionalSettingsProps {
  settings: GeneralSettings
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Regional settings component for currency and timezone
 */
export function RegionalSettings({ settings, onSettingChange }: RegionalSettingsProps) {
  const { settings: contextSettings, currencies, updateCurrency, resetToDefault } = useSettings()
  const [isResetting, setIsResetting] = useState(false)

  // Safety check for currencies
  if (!currencies || !Array.isArray(currencies) || currencies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Regional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    )
  }

  const handleResetCurrency = () => {
    setIsResetting(true)
    resetToDefault()
    setTimeout(() => {
      setIsResetting(false)
      window.location.reload() // Refresh untuk apply changes
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Regional
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleResetCurrency}
            disabled={isResetting}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {isResetting ? 'Mereset...' : 'Reset ke IDR'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Mata Uang Saat Ini:</strong> {contextSettings?.currency?.name || 'IDR'} ({contextSettings?.currency?.symbol || 'Rp'})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Mata Uang</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={contextSettings?.currency?.code || 'IDR'}
              onChange={(e) => {
                const selected = currencies.find(c => c.code === e.target.value)
                if (selected) {
                  updateCurrency(selected)
                  onSettingChange('general', 'currency', e.target.value)
                }
              }}
            >
              {Array.isArray(currencies) && currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
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
