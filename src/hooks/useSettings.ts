import { createClientLogger } from '@/lib/client-logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'

const logger = createClientLogger('useSettings')

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
}

export interface BusinessSettings {
  business_name: string
  business_address?: string
  business_phone?: string
  business_email?: string
  tax_id?: string
  currency: string
  timezone: string
  date_format: string
  logo_url?: string
}

export interface ProfileSettings extends UserProfile {}

export interface PreferencesSettings extends NotificationPreferences {}

interface NotificationPreferences {
  email_notifications: boolean
  low_stock_alerts: boolean
  order_updates: boolean
  price_change_alerts: boolean
  weekly_reports: boolean
}

/**
 * Get user profile
 */
export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: () => fetchApi<UserProfile>('/api/settings/profile'),
  })
}

/**
 * Update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => putApi('/api/settings/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profil berhasil diperbarui')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to update user profile')
      toast.error('Gagal memperbarui profil')
    },
  })
}

/**
 * Get business settings
 */
export function useBusinessSettings() {
  return useQuery<BusinessSettings>({
    queryKey: ['business-settings'],
    queryFn: () => fetchApi<BusinessSettings>('/api/settings/business'),
  })
}

/**
 * Update business settings
 */
export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<BusinessSettings>) => putApi('/api/settings/business', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] })
      toast.success('Pengaturan bisnis berhasil diperbarui')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to update business settings')
      toast.error('Gagal memperbarui pengaturan bisnis')
    },
  })
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: () => fetchApi<NotificationPreferences>('/api/settings/preferences'),
  })
}

/**
 * Update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) => putApi('/api/settings/preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Preferensi notifikasi berhasil diperbarui')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to update notification preferences')
      toast.error('Gagal memperbarui preferensi notifikasi')
    },
  })
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) => postApi('/api/settings/change-password', data),
    onSuccess: () => {
      toast.success('Password berhasil diubah')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to change password')
      toast.error('Gagal mengubah password')
    },
  })
}

/**
 * Upload business logo
 */
export function useUploadBusinessLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/settings/upload-logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!response.ok) throw new Error('Failed to upload logo')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] })
      toast.success('Logo berhasil diupload')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to upload logo')
      toast.error('Gagal mengupload logo')
    },
  })
}


// Aliases for backward compatibility
export const useProfileSettings = useUserProfile
export const usePreferencesSettings = useNotificationPreferences
export const useUpdateProfileSettings = useUpdateUserProfile
export const useUpdatePreferencesSettings = useUpdateNotificationPreferences
