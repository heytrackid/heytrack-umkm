import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'

// Import existing components
import { BusinessInfoSettings } from '@/app/settings/components/BusinessInfoSettings'
import { BusinessSettings } from '@/app/settings/components/BusinessSettings'
import { NotificationSettings } from '@/app/settings/components/NotificationSettings'
import { ProfileSettings } from '@/app/settings/components/ProfileSettings'
import { RegionalSettings } from '@/app/settings/components/RegionalSettings'
import { SecuritySettings } from '@/app/settings/components/SecuritySettings'
import { UIThemeSettings } from '@/app/settings/components/UIThemeSettings'
import { DateTimeSettings } from '@/app/settings/components/DateTimeSettings'
import { NumberCurrencySettings } from '@/app/settings/components/NumberCurrencySettings'
import { DangerZone } from '@/app/settings/components/DangerZone'

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

export const SettingsTabs = ({ activeTab, onTabChange, settings, onSettingChange }: SettingsTabsProps) => (
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
