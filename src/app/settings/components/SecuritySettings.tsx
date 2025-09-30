'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'

/**
 * Security settings component for password changes
 */
export function SecuritySettings() {
  const { t } = useI18n()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('settings.security.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">{t('settings.security.currentPassword')}</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPassword ?"text" :"password"}
              placeholder={t('settings.security.currentPasswordPlaceholder')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="newPassword">{t('settings.security.newPassword')}</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder={t('settings.security.newPasswordPlaceholder')}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">{t('settings.security.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('settings.security.confirmPasswordPlaceholder')}
          />
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          {t('settings.security.updatePassword')}
        </Button>
      </CardContent>
    </Card>
  )
}
