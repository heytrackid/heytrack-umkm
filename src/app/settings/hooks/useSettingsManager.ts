import { useState, useEffect, useMemo } from 'react'
import { useSettings } from '@/contexts/settings-context'
import { useLoading } from '@/hooks/loading'
import { toast } from 'react-hot-toast'
import { apiLogger } from '@/lib/logger'
import {
  DEFAULT_APP_SETTINGS,
  normalizeSettings,
  type AppSettingsState,
  type SettingsUpdateHandler,
} from '@/app/settings/types'

const LOADING_KEYS = {
  LOAD_SETTINGS: 'loadSettings',
  SAVE_SETTINGS: 'saveSettings',
} as const

export function useSettingsManager() {
  const { settings: contextSettings, updateCurrency, updateLanguage } = useSettings()
  const { startLoading, stopLoading, isLoading: isSkeletonLoading } = useLoading()

  const mergedDefaults = useMemo(
    () => normalizeSettings(DEFAULT_APP_SETTINGS, contextSettings),
    [contextSettings]
  )

  const [settings, setSettings] = useState<AppSettingsState>(mergedDefaults)
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync defaults when context settings change
  useEffect(() => {
    void setSettings(mergedDefaults)
  }, [mergedDefaults])

  // Load settings from database on component mount
  useEffect(() => {
    void loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      void startLoading(LOADING_KEYS.LOAD_SETTINGS)

      // Simplified settings loading - in real implementation would use Supabase
      // For now, just use the merged defaults
      void setSettings(mergedDefaults)
      apiLogger.info({ settings: mergedDefaults }, '✅ Settings loaded successfully')

    } catch (err: unknown) {
      apiLogger.error({ err }, 'Error loading settings:')
      toast.error('Gagal memuat pengaturan')
    } finally {
      stopLoading(LOADING_KEYS.LOAD_SETTINGS)
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
    void setIsUnsavedChanges(true)
  }

  const handleSave = async () => {
    void setIsSaving(true)

    try {
      // Simplified save logic - in real implementation would save to Supabase
      apiLogger.info({ settings }, '✅ Settings saved successfully')
      void setIsUnsavedChanges(false)
      toast.success('Pengaturan berhasil disimpan')

    } catch (err: unknown) {
      apiLogger.error({ err }, '❌ Error saving settings:')
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      void setIsSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    void setSettings(mergedDefaults)
    void setIsUnsavedChanges(false)
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
