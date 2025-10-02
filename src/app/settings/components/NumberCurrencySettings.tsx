'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'
import { useSettings, currencies } from '@/contexts/settings-context'

interface NumberCurrencySettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Pengaturan format angka dan mata uang
 */
export function NumberCurrencySettings({ settings, onSettingChange }: NumberCurrencySettingsProps) {
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
            onChange={(e) => onSettingChange('ui', 'numberFormat', e.target.value)}
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
            value={currentSettings.currency.code}
            onChange={(e) => {
              const selectedCurrency = currencies.find(c => c.code === e.target.value)
              if (selectedCurrency) {
                updateCurrency(selectedCurrency)
              }
            }}
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
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
