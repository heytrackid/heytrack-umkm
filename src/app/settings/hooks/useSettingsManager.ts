import { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'

import { DEFAULT_APP_SETTINGS, normalizeSettings, type AppSettingsState, type SettingsUpdateHandler } from '@/app/settings/types'
import { useSettings } from '@/contexts/settings-context'

export function useSettingsManager() {
  const { settings: contextSettings } = useSettings()

  // We still use mergedDefaults to provide initial state before fetch, or if fetch fails
  const mergedDefaults = useMemo(
    () => normalizeSettings(DEFAULT_APP_SETTINGS, contextSettings),
    [contextSettings]
  )

  const [settings, setSettings] = useState<AppSettingsState>(mergedDefaults)
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        // Fetch data in parallel
        const [businessRes, profileRes, preferencesRes] = await Promise.all([
            fetch('/api/settings/business'),
            fetch('/api/settings/profile'),
            fetch('/api/settings/preferences')
        ])

        const [businessData, profileData, preferencesData] = await Promise.all([
            businessRes.ok ? businessRes.json().then(r => r.data) : {},
            profileRes.ok ? profileRes.json().then(r => r.data) : {},
            preferencesRes.ok ? preferencesRes.json().then(r => r.data) : {}
        ])

        // Cast to unknown then proper type to access properties safely
        const prefData = preferencesData as { system?: unknown, ui?: unknown }
        
        // Combine all data
        const combinedSettings = {
            general: { ...mergedDefaults.general, ...(businessData || {}) },
            user: { ...mergedDefaults.user, ...(profileData || {}) },
            system: { ...mergedDefaults.system, ...(prefData?.system as object || {}) },
            ui: { ...mergedDefaults.ui, ...(prefData?.ui as object || {}) }
        } as AppSettingsState

        setSettings(combinedSettings)
      } catch (error) {
        logger.error(error, 'Failed to fetch settings')
        toast.error('Gagal memuat pengaturan. Menggunakan nilai default.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [mergedDefaults]) // Re-fetch if defaults change (e.g. context currency changes), though mostly runs once on mount effectively

  const handleSettingChange: SettingsUpdateHandler = (category, key, value) => {
    setSettings(prev => {
      const currentCategory = prev[category]
      
      const updatedCategory = {
        ...currentCategory,
        [key]: value,
      } as unknown as AppSettingsState[typeof category]

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
        // Save in parallel based on category logic
        // Business -> /api/settings/business
        // Profile -> /api/settings/profile
        // System & UI -> /api/settings/preferences
        
        const savePromises = []
        
        // Always save all modified sections? Or we could track dirty sections.
        // For simplicity, save all. API handles merging.
        
        savePromises.push(
            fetch('/api/settings/business', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings.general)
            })
        )

        savePromises.push(
            fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings.user)
            })
        )

        savePromises.push(
            fetch('/api/settings/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: settings.system,
                    ui: settings.ui
                })
            })
        )

        const results = await Promise.all(savePromises)
        
        // Check if any failed
        const failed = results.filter(r => !r.ok)
        if (failed.length > 0) {
            throw new Error('Some settings failed to save')
        }

        setIsUnsavedChanges(false)
        toast.success('Pengaturan berhasil disimpan')

    } catch (error) {
      logger.error(error, 'Failed to save settings')
      toast.error('Gagal menyimpan pengaturan. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    // In a real app, maybe re-fetch from server? 
    // Or just reset to last fetched state?
    // For now, we'll reload the page or just warn user.
    // Let's re-fetch to ensure we have latest server state
    window.location.reload()
  }

  return {
    settings,
    isUnsavedChanges,
    isSaving,
    isSkeletonLoading: isLoading,
    handleSettingChange,
    handleSave,
    handleReset,
  }
}
