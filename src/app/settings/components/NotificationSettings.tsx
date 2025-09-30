'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell } from 'lucide-react'

interface NotificationSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Notification settings component
 */
export function NotificationSettings({ settings, onSettingChange }: NotificationSettingsProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {"Placeholder"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
          </div>
          <Switch
            checked={settings.notifications.emailNotifications}
            onCheckedChange={(checked) => onSettingChange('notifications', 'emailNotifications', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
          </div>
          <Switch
            checked={settings.notifications.pushNotifications}
            onCheckedChange={(checked) => onSettingChange('notifications', 'pushNotifications', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
          </div>
          <Switch
            checked={settings.notifications.lowStockAlert}
            onCheckedChange={(checked) => onSettingChange('notifications', 'lowStockAlert', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
          </div>
          <Switch
            checked={settings.notifications.orderUpdates}
            onCheckedChange={(checked) => onSettingChange('notifications', 'orderUpdates', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
          </div>
          <Switch
            checked={settings.notifications.dailyReports}
            onCheckedChange={(checked) => onSettingChange('notifications', 'dailyReports', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
          </div>
          <Switch
            checked={settings.notifications.weeklyReports}
            onCheckedChange={(checked) => onSettingChange('notifications', 'weeklyReports', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{"Placeholder"}</p>
            <p className="text-sm text-muted-foreground">{"Placeholder"}</p>
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
