import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AppSettingsState, SettingsUpdateHandler } from '../../types'

// Import existing components
import { BusinessInfoSettings } from '../BusinessInfoSettings'
import { BusinessSettings } from '../BusinessSettings'
import { NotificationSettings } from '../NotificationSettings'
import { ProfileSettings } from '../ProfileSettings'
import { RegionalSettings } from '../RegionalSettings'
import { SecuritySettings } from '../SecuritySettings'
import { UIThemeSettings } from '../UIThemeSettings'
import { DateTimeSettings } from '../DateTimeSettings'
import { NumberCurrencySettings } from '../NumberCurrencySettings'
import { DangerZone } from '../DangerZone'

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

export function SettingsTabs({ activeTab, onTabChange, settings, onSettingChange }: SettingsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
        <TabsTrigger value="general" className="text-xs sm:text-sm">Umum</TabsTrigger>
        <TabsTrigger value="profile" className="text-xs sm:text-sm">Profil</TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifikasi</TabsTrigger>
        <TabsTrigger value="system" className="text-xs sm:text-sm">Sistem</TabsTrigger>
        <TabsTrigger value="ui" className="text-xs sm:text-sm">Tampilan</TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general" className="space-y-6">
        <BusinessInfoSettings settings={settings} onSettingChange={onSettingChange} />
        <RegionalSettings settings={settings} onSettingChange={onSettingChange} />
      </TabsContent>

      {/* Profile Settings */}
      <TabsContent value="profile" className="space-y-6">
        <ProfileSettings settings={settings} onSettingChange={onSettingChange} />
        <SecuritySettings />
      </TabsContent>

      {/* Notifications Settings */}
      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings settings={settings} onSettingChange={onSettingChange} />
      </TabsContent>

      {/* System Settings */}
      <TabsContent value="system" className="space-y-6">
        <BusinessSettings settings={settings} onSettingChange={onSettingChange} />
        <DangerZone />
      </TabsContent>

      {/* UI Settings */}
      <TabsContent value="ui" className="space-y-6">
        <UIThemeSettings settings={settings} onSettingChange={onSettingChange} />
        <DateTimeSettings settings={settings} onSettingChange={onSettingChange} />
        <NumberCurrencySettings settings={settings} onSettingChange={onSettingChange} />
      </TabsContent>
    </Tabs>
  )
}
