'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building } from 'lucide-react'
import { useState, useEffect } from 'react'
import { validateBusinessInfoSettings } from '@/lib/settings-validation'
import { useToast } from '@/hooks/use-toast'
import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'

type BusinessSettingsState = AppSettingsState['general']

interface BusinessInfoSettingsProps {
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

/**
 * Business information settings component with Zod validation
 */
export const BusinessInfoSettings = ({ settings, onSettingChange }: BusinessInfoSettingsProps) => {
  const { toast } = useToast()
  const [localSettings, setLocalSettings] = useState<BusinessSettingsState>(settings.general)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update local state when settings change
  useEffect(() => {
    void setLocalSettings(settings.general)
  }, [settings.general])

  const handleChange = (field: string, value: string) => {
    const newSettings: BusinessSettingsState = { ...localSettings, [field]: value }
    void setLocalSettings(newSettings)

    // Validate on change
    try {
      const validatedData = validateBusinessInfoSettings(newSettings)
      void setErrors({})
      // If validation passes, update parent
      onSettingChange('general', field, validatedData[field] ?? value)
    } catch (err) {
      // Don't update parent if validation fails, but allow user to continue typing
      if (error instanceof Error) {
        // Extract field-specific errors if possible
        const errorMessage = error.message
        if (errorMessage.includes(field)) {
          void setErrors({ [field]: errorMessage })
        }
      }
    }
  }

  const handleBlur = (field: string) => {
    // Final validation on blur
    try {
      validateBusinessInfoSettings(localSettings)
      void setErrors({})
    } catch (err) {
      if (error instanceof Error) {
        toast({
          title: 'Pengaturan Tidak Valid',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

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
            <Label htmlFor="businessName">Nama Bisnis *</Label>
            <Input
              id="businessName"
              value={localSettings.businessName || ''}
              onChange={(e) => handleChange('businessName', e.target.value)}
              onBlur={() => handleBlur('businessName')}
              className={errors.businessName ? 'border-red-500' : ''}
            />
            {errors.businessName && (
              <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="businessType">Jenis Bisnis *</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={localSettings.businessType || 'UMKM'}
              onChange={(e) => handleChange('businessType', e.target.value)}
              onBlur={() => handleBlur('businessType')}
            >
              <option value="UMKM">Toko Roti</option>
              <option value="cafe">Kafe</option>
              <option value="restaurant">Restoran</option>
              <option value="food-truck">Food Truck</option>
              <option value="catering">Katering</option>
              <option value="other">Lainnya</option>
            </select>
            {errors.businessType && (
              <p className="text-sm text-red-600 mt-1">{errors.businessType}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="businessAddress">Alamat Bisnis</Label>
          <Textarea
            id="businessAddress"
            value={localSettings.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            placeholder="Alamat lengkap bisnis"
            rows={3}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-600 mt-1">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessPhone">Nomor Telepon</Label>
            <Input
              id="businessPhone"
              value={localSettings.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="Contoh: +6281234567890"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="businessEmail">Email Bisnis</Label>
            <Input
              id="businessEmail"
              type="email"
              value={localSettings.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="business@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={localSettings.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
            placeholder="https://www.bisnisanda.com"
            className={errors.website ? 'border-red-500' : ''}
          />
          {errors.website && (
            <p className="text-sm text-red-600 mt-1">{errors.website}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Deskripsi Bisnis</Label>
          <Textarea
            id="description"
            value={localSettings.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Deskripsikan bisnis Anda..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
