import { Suspense, lazy } from 'react'

import { BusinessSettings } from '@/app/settings/components/BusinessSettings'
import { DangerZone } from '@/app/settings/components/DangerZone'
import { DateTimeSettings } from '@/app/settings/components/DateTimeSettings'

import { NumberCurrencySettings } from '@/app/settings/components/NumberCurrencySettings'
import { ProfileSettings } from '@/app/settings/components/ProfileSettings'
import { SecuritySettings } from '@/app/settings/components/SecuritySettings'
import { SettingsLoadingSkeleton } from '@/app/settings/components/SettingsLoadingSkeleton'
import { UIThemeSettings } from '@/app/settings/components/UIThemeSettings'
import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'

// Lazy load settings components only when tabs are accessed (smart code splitting)
// ✅ Correct pattern for named exports with React.lazy
const BusinessInfoSettings = lazy(() => import('@/app/settings/components/BusinessInfoSettings').then(mod => ({ default: mod.BusinessInfoSettings })))
const RegionalSettings = lazy(() => import('@/app/settings/components/RegionalSettings').then(mod => ({ default: mod.RegionalSettings })))


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
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <BusinessInfoSettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <RegionalSettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
    </SwipeableTabsContent>

    {/* Profile Settings */}
    <SwipeableTabsContent value="profile" className="space-y-6">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <ProfileSettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SecuritySettings />
      </Suspense>
    </SwipeableTabsContent>



    {/* System Settings */}
    <SwipeableTabsContent value="system" className="space-y-6">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <BusinessSettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <DangerZone />
      </Suspense>
    </SwipeableTabsContent>

    {/* UI Settings */}
    <SwipeableTabsContent value="ui" className="space-y-6">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <UIThemeSettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <DateTimeSettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <NumberCurrencySettings settings={settings} onSettingChange={onSettingChange} />
      </Suspense>
    </SwipeableTabsContent>
  </SwipeableTabs>
)
