import { Suspense, lazy } from 'react'

import { SettingsLoadingSkeleton } from '@/app/settings/components/SettingsLoadingSkeleton'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'

import type { AppSettingsState, SettingsUpdateHandler } from '@/app/settings/types'

// Lazy load all settings components
const BusinessInfoSettings = lazy(() => import('@/app/settings/components/BusinessInfoSettings').then(mod => ({ default: mod.BusinessInfoSettings })))
const BusinessSettings = lazy(() => import('@/app/settings/components/BusinessSettings').then(mod => ({ default: mod.BusinessSettings })))
const NotificationSettings = lazy(() => import('@/app/settings/components/NotificationSettings').then(mod => ({ default: mod.NotificationSettings })))
const ProfileSettings = lazy(() => import('@/app/settings/components/ProfileSettings').then(mod => ({ default: mod.ProfileSettings })))
const RegionalSettings = lazy(() => import('@/app/settings/components/RegionalSettings').then(mod => ({ default: mod.RegionalSettings })))
const SecuritySettings = lazy(() => import('@/app/settings/components/SecuritySettings').then(mod => ({ default: mod.SecuritySettings })))
const UIThemeSettings = lazy(() => import('@/app/settings/components/UIThemeSettings').then(mod => ({ default: mod.UIThemeSettings })))
const DateTimeSettings = lazy(() => import('@/app/settings/components/DateTimeSettings').then(mod => ({ default: mod.DateTimeSettings })))
const NumberCurrencySettings = lazy(() => import('@/app/settings/components/NumberCurrencySettings').then(mod => ({ default: mod.NumberCurrencySettings })))
const DangerZone = lazy(() => import('@/app/settings/components/DangerZone').then(mod => ({ default: mod.DangerZone })))


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
      <SwipeableTabsTrigger value="notifications" className="text-xs sm:text-sm">Notifikasi</SwipeableTabsTrigger>
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

    {/* Notifications Settings */}
    <SwipeableTabsContent value="notifications" className="space-y-6">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <NotificationSettings settings={settings} onSettingChange={onSettingChange} />
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
