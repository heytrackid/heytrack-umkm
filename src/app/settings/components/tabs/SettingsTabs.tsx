import { BusinessSettings } from '@/app/settings/components/BusinessSettings'
import { BusinessInfoSettings } from '@/app/settings/components/BusinessInfoSettings'
import { DangerZone } from '@/app/settings/components/DangerZone'
import { DateTimeSettings } from '@/app/settings/components/DateTimeSettings'
import { NumberCurrencySettings } from '@/app/settings/components/NumberCurrencySettings'
import { ProfileSettings } from '@/app/settings/components/ProfileSettings'
import { RegionalSettings } from '@/app/settings/components/RegionalSettings'
import { SecuritySettings } from '@/app/settings/components/SecuritySettings'
import { UIThemeSettings } from '@/app/settings/components/UIThemeSettings'
import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'


// Import existing components

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  settings: AppSettingsState
  onSettingChange: SettingsUpdateHandler
}

export const SettingsTabs = ({ activeTab, onTabChange, settings, onSettingChange }: SettingsTabsProps) => (
  <SwipeableTabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
    <SwipeableTabsList>
      <SwipeableTabsTrigger value="general" className="text-xs sm:text-sm">Umum</SwipeableTabsTrigger>
      <SwipeableTabsTrigger value="profile" className="text-xs sm:text-sm">Profil</SwipeableTabsTrigger>

      <SwipeableTabsTrigger value="system" className="text-xs sm:text-sm">Sistem</SwipeableTabsTrigger>
      <SwipeableTabsTrigger value="ui" className="text-xs sm:text-sm">Tampilan</SwipeableTabsTrigger>
    </SwipeableTabsList>

    {/* General Settings */}
    <SwipeableTabsContent value="general" className="space-y-6">
      <BusinessInfoSettings settings={settings} onSettingChange={onSettingChange} />
      <RegionalSettings settings={settings} onSettingChange={onSettingChange} />
    </SwipeableTabsContent>

    {/* Profile Settings */}
    <SwipeableTabsContent value="profile" className="space-y-6">
      <ProfileSettings settings={settings} onSettingChange={onSettingChange} />
      <SecuritySettings />
    </SwipeableTabsContent>



    {/* System Settings */}
    <SwipeableTabsContent value="system" className="space-y-6">
      <BusinessSettings settings={settings} onSettingChange={onSettingChange} />
      <DangerZone />
    </SwipeableTabsContent>

    {/* UI Settings */}
    <SwipeableTabsContent value="ui" className="space-y-6">
      <UIThemeSettings settings={settings} onSettingChange={onSettingChange} />
      <DateTimeSettings settings={settings} onSettingChange={onSettingChange} />
      <NumberCurrencySettings settings={settings} onSettingChange={onSettingChange} />
    </SwipeableTabsContent>
  </SwipeableTabs>
)
