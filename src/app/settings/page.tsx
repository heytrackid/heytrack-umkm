'use client'

import { Suspense, lazy, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'

import { SettingsLoadingSkeleton } from '@/app/settings/components/index'

// Import core components directly for better performance
import { SettingsHeader } from '@/app/settings/components/layout/SettingsHeader'
import { SettingsQuickLinks } from '@/app/settings/components/SettingsQuickLinks'
import { UnsavedChangesPrompt } from '@/app/settings/components/UnsavedChangesPrompt'
import { useSettingsManager } from '@/app/settings/hooks/index'

// Only lazy load the heavy tabs component
// ✅ Correct pattern for named exports (per Next.js docs)
const SettingsTabs = lazy(() => import('./components/tabs/SettingsTabs').then(mod => mod.SettingsTabs))

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
        <SettingsHeader
          isUnsavedChanges={isUnsavedChanges}
          isSaving={isSaving}
          onSave={handleSave}
          onReset={handleReset}
        />

        {isSkeletonLoading ? (
          <SettingsLoadingSkeleton />
        ) : (
          <>
            <SettingsQuickLinks />

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

        <UnsavedChangesPrompt
          isUnsavedChanges={isUnsavedChanges}
          onReset={() => handleReset()}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </AppLayout>
  )
}

export default SettingsPage
