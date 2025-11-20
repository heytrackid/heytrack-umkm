'use client'

import { DollarSign } from '@/components/icons'

import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useSettings, currencies } from '@/contexts/settings-context'




interface NumberCurrencySettingsProps {
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

/**
 * Pengaturan format angka dan mata uang
 */
export const NumberCurrencySettings = ({ settings, onSettingChange }: NumberCurrencySettingsProps) => {
  const { settings: currentSettings, updateCurrency, formatCurrency } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Format Angka & Mata Uang
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="numberFormat">Format Angka</Label>
          <select
            id="numberFormat"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.ui.numberFormat}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSettingChange('ui', 'numberFormat', e.target.value)}
          >
            <option value="1.234.567,89">1.234.567,89 (Indonesia)</option>
            <option value="1,234,567.89">1,234,567.89 (US)</option>
            <option value="1 234 567,89">1 234 567,89 (Europe)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="uiCurrency">Mata Uang Utama</Label>
          <select
            id="uiCurrency"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={currentSettings.currency['code']}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const selectedCurrency = currencies.find(c => c['code'] === e.target.value)
              if (selectedCurrency) {
                updateCurrency(selectedCurrency)
                onSettingChange('ui', 'currency', selectedCurrency['code'])
              }
            }}
          >
            {currencies.map(currency => (
              <option key={currency['code']} value={currency['code']}>
                {currency.symbol} ({currency.name})
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-1">
            Contoh: {formatCurrency(123456)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
