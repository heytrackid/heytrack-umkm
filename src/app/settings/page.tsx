'use client'

import { Suspense, lazy, useState } from 'react'

import AppLayout from '@/components/layout/app-layout'

import { SettingsLoadingSkeleton } from './components'
import { useSettingsManager } from './hooks'

// Lazy load settings components
const SettingsHeader = lazy(() => import('./components/layout/SettingsHeader').then(mod => ({ default: mod.SettingsHeader })))
const SettingsTabs = lazy(() => import('./components/tabs/SettingsTabs').then(mod => ({ default: mod.SettingsTabs })))
const SettingsQuickLinks = lazy(() => import('./components/SettingsQuickLinks').then(mod => ({ default: mod.SettingsQuickLinks })))
const UnsavedChangesPrompt = lazy(() => import('./components/UnsavedChangesPrompt').then(mod => ({ default: mod.UnsavedChangesPrompt })))

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general')

  const {
    settings,
    isUnsavedChanges,
    isSaving,
    isSkeletonLoading,
    handleSettingChange,
    handleSave,
    handleReset,
  } = useSettingsManager()

  return (
    <AppLayout>
      <div className="space-y-6">
        <Suspense fallback={<SettingsLoadingSkeleton />}>
          <SettingsHeader
            isUnsavedChanges={isUnsavedChanges}
            isSaving={isSaving}
            onSave={handleSave}
            onReset={handleReset}
          />
        </Suspense>

        {isSkeletonLoading ? (
          <SettingsLoadingSkeleton />
        ) : (
          <>
            <Suspense fallback={<SettingsLoadingSkeleton />}>
              <SettingsQuickLinks />
            </Suspense>

            <Suspense fallback={<SettingsLoadingSkeleton />}>
              <SettingsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                settings={settings}
                onSettingChange={handleSettingChange}
              />
            </Suspense>
          </>
        )}

        <Suspense fallback={<SettingsLoadingSkeleton />}>
          <UnsavedChangesPrompt
            isUnsavedChanges={isUnsavedChanges}
            onReset={() => handleReset()}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </Suspense>
      </div>
    </AppLayout>
  )
}

export default SettingsPage
