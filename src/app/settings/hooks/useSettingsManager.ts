import { useState, useEffect, useMemo, useRef } from 'react'

import { DEFAULT_APP_SETTINGS, normalizeSettings, type AppSettingsState, type SettingsUpdateHandler, } from '@/app/settings/types'
import { useSettings } from '@/contexts/settings-context'

export function useSettingsManager() {
  const { settings: contextSettings } = useSettings()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Initialize settings immediately - no fake loading needed
  useEffect(() => {
    setSettings(mergedDefaults)
  }, [mergedDefaults])

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
      setIsUnsavedChanges(false)
      // In a real implementation, this would save to the database
      timeoutRef.current = setTimeout(() => {
        setIsSaving(false)
      }, 500) // Simulate save delay

     } catch (_error) {
      setIsSaving(false)
      // In a real implementation, show error toast
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
    isSkeletonLoading: false, // No more fake loading
    handleSettingChange,
    handleSave,
    handleReset,
  }
}
