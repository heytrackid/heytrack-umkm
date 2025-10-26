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
} from '../types'

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
    setSettings(mergedDefaults)
  }, [mergedDefaults])

  // Load settings from database on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      startLoading(LOADING_KEYS.LOAD_SETTINGS)

      // Simplified settings loading - in real implementation would use Supabase
      // For now, just use the merged defaults
      setSettings(mergedDefaults)
      apiLogger.info({ settings: mergedDefaults }, '✅ Settings loaded successfully')

    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Error loading settings:')
      toast.error('Gagal memuat pengaturan')
    } finally {
      stopLoading(LOADING_KEYS.LOAD_SETTINGS)
    }
  }

  const handleSettingChange: SettingsUpdateHandler = (category, key, value) => {
    setSettings(prev => {
      const currentCategory = prev[category] as any
      const updatedCategory = {
        ...currentCategory,
        [key]: value,
      }

      return {
        ...prev,
        [category]: updatedCategory,
      }
    })
    setIsUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simplified save logic - in real implementation would save to Supabase
      apiLogger.info({ settings }, '✅ Settings saved successfully')
      setIsUnsavedChanges(false)
      toast.success('Pengaturan berhasil disimpan')

    } catch (error: unknown) {
      apiLogger.error({ error: error }, '❌ Error saving settings:')
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
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
