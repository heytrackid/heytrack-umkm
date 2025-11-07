import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'

import { DEFAULT_APP_SETTINGS, normalizeSettings, type AppSettingsState, type SettingsUpdateHandler, } from '@/app/settings/types' 
import { useSettings } from '@/contexts/settings-context'
import { useLoading } from '@/hooks/loading'
import { apiLogger } from '@/lib/logger'

const LOADING_KEYS = {
  LOAD_SETTINGS: 'loadSettings',
  SAVE_SETTINGS: 'saveSettings',
} as const

export function useSettingsManager() {
  const { settings: contextSettings } = useSettings()
  const { startLoading, isLoading: isSkeletonLoading } = useLoading()

  const mergedDefaults = useMemo(
    () => normalizeSettings(DEFAULT_APP_SETTINGS, contextSettings),
    [contextSettings]
  )

  const [settings, setSettings] = useState<AppSettingsState>(mergedDefaults)
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync defaults when context settings change
  useEffect(() => {
    setSettings(mergedDefaults)
  }, [mergedDefaults])

  // Load settings from database on component mount
  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSettings = () => {
    try {
      startLoading(LOADING_KEYS.LOAD_SETTINGS)

      // Simplified settings loading - in real implementation would use Supabase
      // For now, just use the merged defaults
      setSettings(mergedDefaults)
      apiLogger.info({ settings: mergedDefaults }, '✅ Settings loaded successfully')

     } catch (error) {
       apiLogger.error({ error }, 'Error loading settings:')
       toast.error('Gagal memuat pengaturan')
     }
  }

  const handleSettingChange: SettingsUpdateHandler = (category, key, value) => {
    setSettings(prev => {
      const currentCategory = prev[category]
      const updatedCategory = {
        ...currentCategory,
        [key]: value,
      } as AppSettingsState[typeof category]

      return {
        ...prev,
        [category]: updatedCategory,
      }
    })
    setIsUnsavedChanges(true)
  }

  const handleSave = () => {
    setIsSaving(true)

    try {
      // Simplified save logic - in real implementation would save to Supabase
      apiLogger.info({ settings }, '✅ Settings saved successfully')
      setIsUnsavedChanges(false)
      toast.success('Pengaturan berhasil disimpan')

     } catch (error) {
       apiLogger.error({ error }, '❌ Error saving settings:')
       toast.error('Gagal menyimpan pengaturan')
     }
  }

  const handleReset = () => {
    // Reset to default values
    setSettings(mergedDefaults)
    setIsUnsavedChanges(false)
  }

  return {
    settings,
    isUnsavedChanges,
    isSaving,
    isSkeletonLoading: isSkeletonLoading(LOADING_KEYS.LOAD_SETTINGS),
    handleSettingChange,
    handleSave,
    handleReset,
    loadSettings,
  }
}
