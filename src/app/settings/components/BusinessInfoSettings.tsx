'use client'

import { Building } from '@/components/icons'
import React, { useLayoutEffect, useState } from 'react'

import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { validateBusinessInfoSettingsSafe } from '@/lib/settings-validation'

type BusinessSettingsState = AppSettingsState['general']

interface BusinessInfoSettingsProps {
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

/**
 * Business information settings component with Zod validation
 */
const BusinessInfoSettingsComponent = ({ settings, onSettingChange }: BusinessInfoSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<BusinessSettingsState>(settings.general)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update local state when settings change
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSettings(settings.general)
  }, [settings])

  const handleChange = (field: string, value: string) => {
    const newSettings: BusinessSettingsState = { ...localSettings, [field]: value }
    setLocalSettings(newSettings)

    // Validate on change
    const validation = validateBusinessInfoSettingsSafe(newSettings)
    setErrors(validation.errors ?? {})
    // Always update parent so changes are not lost even while other fields are invalid
    onSettingChange('general', field, value)
  }

  const handleBlur = (_field: string) => {
    // Final validation on blur
    const validation = validateBusinessInfoSettingsSafe(localSettings)
    setErrors(validation.errors ?? {})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Building className="h-5 w-5" />
          Informasi Bisnis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Nama Bisnis *</Label>
            <Input
              id="businessName"
              value={localSettings.businessName || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('businessName', e.target.value)}
              onBlur={() => handleBlur('businessName')}
              className={errors['businessName'] ? 'border-red-500' : ''}
            />
            {errors['businessName'] && (
              <p className="text-sm text-red-600 mt-1">{errors['businessName']}</p>
            )}
          </div>
          <div>
            <Label htmlFor="businessType">Jenis Bisnis *</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={localSettings.businessType || 'UMKM'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('businessType', e.target.value)}
              onBlur={() => handleBlur('businessType')}
            >
              <option value="UMKM">Toko Roti</option>
              <option value="cafe">Kafe</option>
              <option value="restaurant">Restoran</option>
              <option value="food-truck">Food Truck</option>
              <option value="catering">Katering</option>
              <option value="other">Lainnya</option>
            </select>
            {errors['businessType'] && (
              <p className="text-sm text-red-600 mt-1">{errors['businessType']}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="businessAddress">Alamat Bisnis</Label>
          <Textarea
            id="businessAddress"
            value={localSettings.address || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            placeholder="Alamat lengkap bisnis"
            rows={3}
            className={errors['address'] ? 'border-red-500' : ''}
          />
          {errors['address'] && (
            <p className="text-sm text-red-600 mt-1">{errors['address']}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessPhone">Nomor Telepon</Label>
            <Input
              id="businessPhone"
              value={localSettings.phone || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="Contoh: +6281234567890"
              className={errors['phone'] ? 'border-red-500' : ''}
            />
            {errors['phone'] && (
              <p className="text-sm text-red-600 mt-1">{errors['phone']}</p>
            )}
          </div>
          <div>
            <Label htmlFor="businessEmail">Email Bisnis</Label>
            <Input
              id="businessEmail"
              type="email"
              value={localSettings.email || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="business@email.com"
              className={errors['email'] ? 'border-red-500' : ''}
            />
            {errors['email'] && (
              <p className="text-sm text-red-600 mt-1">{errors['email']}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={localSettings.website || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
             placeholder="https://www.bisnisanda.com"
             className={errors['website'] ? 'border-red-500' : ''}
           />
           {errors['website'] && (
             <p className="text-sm text-red-600 mt-1">{errors['website']}</p>
           )}
        </div>

        <div>
          <Label htmlFor="description">Deskripsi Bisnis</Label>
          <Textarea
            id="description"
            value={localSettings.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Deskripsikan bisnis Anda..."
             rows={4}
             className={errors['description'] ? 'border-red-500' : ''}
           />
           {errors['description'] && (
             <p className="text-sm text-red-600 mt-1">{errors['description']}</p>
           )}
        </div>
      </CardContent>
    </Card>
  )
}

const BusinessInfoSettings = React.memo(BusinessInfoSettingsComponent)

BusinessInfoSettings.displayName = 'BusinessInfoSettings'

export { BusinessInfoSettings }
