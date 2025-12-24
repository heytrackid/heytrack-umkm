import { handleError } from '@/lib/error-handling'
import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_APP_SETTINGS, normalizeSettings, type AppSettingsState, type SettingsUpdateHandler } from '@/app/settings/types'
import { useSettings } from '@/contexts/settings-context'
import {
    useBusinessSettings,
    usePreferencesSettings,
    useProfileSettings,
    useUpdateBusinessSettings,
    useUpdatePreferencesSettings,
    useUpdateProfileSettings,
    type BusinessSettings,
    type PreferencesSettings,
    type ProfileSettings,
} from '@/hooks/useSettings'

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

  // Use React Query hooks for settings
  const { data: businessData, isLoading: businessLoading } = useBusinessSettings()
  const { data: profileData, isLoading: profileLoading } = useProfileSettings()
  const { data: preferencesData, isLoading: preferencesLoading } = usePreferencesSettings()

  const updateBusinessMutation = useUpdateBusinessSettings()
  const updateProfileMutation = useUpdateProfileSettings()
  const updatePreferencesMutation = useUpdatePreferencesSettings()

  const isLoading = businessLoading || profileLoading || preferencesLoading

  // Combine settings when data changes
  useEffect(() => {
    if (businessData || profileData || preferencesData) {
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
    }
  }, [businessData, profileData, preferencesData, mergedDefaults])

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
        const general = settings.general
        const businessPayload: BusinessSettings = {
          businessName: general.businessName,
          businessType: general.businessType,
          taxId: general.taxNumber,
          address: general.address,
          phone: general.phone,
          email: general.email,
          website: general.website,
          description: general.description,
        }

        // Save in parallel using mutations
        // Map the settings to match API expectations
        await Promise.all([
            updateBusinessMutation.mutateAsync(businessPayload),
            updateProfileMutation.mutateAsync(settings.user as unknown as ProfileSettings),
            updatePreferencesMutation.mutateAsync({
                system: settings.system,
                ui: settings.ui
            } as unknown as PreferencesSettings)
        ])

        setIsUnsavedChanges(false)
        // Don't show success toast here as mutations already do it

    } catch (error) {
      handleError(error, 'Save settings', true, 'Gagal menyimpan pengaturan. Silakan coba lagi.')
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
