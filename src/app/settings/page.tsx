'use client'

import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'

import { SettingsLoadingSkeleton } from '@/app/settings/components/index'

// Import core components directly for better performance
import { SettingsQuickLinks } from '@/app/settings/components/SettingsQuickLinks'
import { UnsavedChangesPrompt } from '@/app/settings/components/UnsavedChangesPrompt'
import { useSettingsManager } from '@/app/settings/hooks/index'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RotateCcw, Save } from '@/components/icons'

import { SettingsTabs } from './components/tabs/SettingsTabs'

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
        <PageHeader
          title="Pengaturan"
          description="Kelola konfigurasi aplikasi Anda"
          actions={
            <>
              {isUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Perubahan belum disimpan
                </Badge>
              )}
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </>
          }
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
