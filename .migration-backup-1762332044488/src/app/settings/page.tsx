'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { useSettingsManager } from './hooks'
import { SettingsHeader, SettingsTabs, SettingsLoadingSkeleton, SettingsQuickLinks, UnsavedChangesPrompt } from './components'

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

            <SettingsTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              settings={settings}
              onSettingChange={handleSettingChange}
            />
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
