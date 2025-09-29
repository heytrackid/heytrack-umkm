'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building } from 'lucide-react'

interface BusinessInfoSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Business information settings component
 */
export function BusinessInfoSettings({ settings, onSettingChange }: BusinessInfoSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informasi Bisnis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Nama Bisnis</Label>
            <Input
              id="businessName"
              value={settings.general.businessName}
              onChange={(e) => onSettingChange('general', 'businessName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="businessType">Jenis Bisnis</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={settings.general.businessType}
              onChange={(e) => onSettingChange('general', 'businessType', e.target.value)}
            >
              <option value="bakery">Bakery</option>
              <option value="cafe">Cafe</option>
              <option value="restaurant">Restaurant</option>
              <option value="food-truck">Food Truck</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            value={settings.general.address}
            onChange={(e) => onSettingChange('general', 'address', e.target.value)}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              value={settings.general.phone}
              onChange={(e) => onSettingChange('general', 'phone', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.general.email}
              onChange={(e) => onSettingChange('general', 'email', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={settings.general.website}
              onChange={(e) => onSettingChange('general', 'website', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="taxNumber">NPWP</Label>
            <Input
              id="taxNumber"
              value={settings.general.taxNumber}
              onChange={(e) => onSettingChange('general', 'taxNumber', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
