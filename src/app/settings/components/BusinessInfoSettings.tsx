'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'

interface BusinessInfoSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Business information settings component
 */
export function BusinessInfoSettings({ settings, onSettingChange }: BusinessInfoSettingsProps) {
  const { t } = useI18n()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {t('settings.businessInfo.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">{t('settings.businessInfo.businessName')}</Label>
            <Input
              id="businessName"
              value={settings.general.businessName}
              onChange={(e) => onSettingChange('general', 'businessName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="businessType">{t('settings.businessInfo.businessType')}</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={settings.general.businessType}
              onChange={(e) => onSettingChange('general', 'businessType', e.target.value)}
            >
              <option value="bakery">{t('settings.businessInfo.types.bakery')}</option>
              <option value="cafe">{t('settings.businessInfo.types.cafe')}</option>
              <option value="restaurant">{t('settings.businessInfo.types.restaurant')}</option>
              <option value="food-truck">{t('settings.businessInfo.types.foodTruck')}</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="address">{t('settings.businessInfo.address')}</Label>
          <Textarea
            id="address"
            value={settings.general.address}
            onChange={(e) => onSettingChange('general', 'address', e.target.value)}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">{t('settings.businessInfo.phone')}</Label>
            <Input
              id="phone"
              value={settings.general.phone}
              onChange={(e) => onSettingChange('general', 'phone', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">{t('settings.businessInfo.email')}</Label>
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
            <Label htmlFor="website">{t('settings.businessInfo.website')}</Label>
            <Input
              id="website"
              value={settings.general.website}
              onChange={(e) => onSettingChange('general', 'website', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="taxNumber">{t('settings.businessInfo.taxNumber')}</Label>
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
