'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'
import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'

interface BusinessSettingsProps {
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

/**
 * Business settings component for tax and stock thresholds
 */
export const BusinessSettings = ({ settings, onSettingChange }: BusinessSettingsProps) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pengaturan Bisnis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="defaultTax">Pajak Default (%)</Label>
          <Input
            id="defaultTax"
            type="number"
            value={settings.system.defaultTax}
            onChange={(e) =>
              onSettingChange('system', 'defaultTax', Number(e.target.value))
            }
          />
        </div>
        <div>
          <Label htmlFor="lowStockThreshold">Threshold Stok Rendah</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            value={settings.system.lowStockThreshold}
            onChange={(e) =>
              onSettingChange('system', 'lowStockThreshold', Number(e.target.value))
            }
          />
          <p className="text-sm text-muted-foreground mt-1">
            Alert akan muncul ketika stok di bawah angka ini
          </p>
        </div>
      </CardContent>
    </Card>
  )
