'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'

interface NotificationSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Notification settings component
 */
export function NotificationSettings({ settings, onSettingChange }: NotificationSettingsProps) {
  const { t } = useI18n()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('settings.notifications.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.email.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.email.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.emailNotifications}
            onCheckedChange={(checked) => onSettingChange('notifications', 'emailNotifications', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.push.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.push.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.pushNotifications}
            onCheckedChange={(checked) => onSettingChange('notifications', 'pushNotifications', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.lowStock.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.lowStock.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.lowStockAlert}
            onCheckedChange={(checked) => onSettingChange('notifications', 'lowStockAlert', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.orders.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.orders.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.orderUpdates}
            onCheckedChange={(checked) => onSettingChange('notifications', 'orderUpdates', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.dailyReports.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.dailyReports.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.dailyReports}
            onCheckedChange={(checked) => onSettingChange('notifications', 'dailyReports', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.weeklyReports.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.weeklyReports.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.weeklyReports}
            onCheckedChange={(checked) => onSettingChange('notifications', 'weeklyReports', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.notifications.monthlyReports.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.notifications.monthlyReports.description')}</p>
          </div>
          <Switch
            checked={settings.notifications.monthlyReports}
            onCheckedChange={(checked) => onSettingChange('notifications', 'monthlyReports', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
