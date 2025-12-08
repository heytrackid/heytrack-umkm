
import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'



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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
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
      successToast('Berhasil', 'Profil berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update user profile', true, 'Gagal memperbarui profil'),
  })
}

/**
 * Get business settings
 */
export function useBusinessSettings() {
  return useQuery<BusinessSettings>({
    queryKey: ['business-settings'],
    queryFn: () => fetchApi<BusinessSettings>('/api/settings/business'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
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
      successToast('Berhasil', 'Pengaturan bisnis berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update business settings', true, 'Gagal memperbarui pengaturan bisnis'),
  })
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: () => fetchApi<NotificationPreferences>('/api/settings/preferences'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
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
      successToast('Berhasil', 'Preferensi notifikasi berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update notification preferences', true, 'Gagal memperbarui preferensi notifikasi'),
  })
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) => postApi('/api/settings/change-password', data),
    onSuccess: () => {
      successToast('Berhasil', 'Password berhasil diubah')
    },
    onError: (error) => handleError(error, 'Change password', true, 'Gagal mengubah password'),
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
      successToast('Berhasil', 'Logo berhasil diupload')
    },
    onError: (error) => handleError(error, 'Upload business logo', true, 'Gagal mengupload logo'),
  })
}


// Aliases for backward compatibility
export const useProfileSettings = useUserProfile
export const usePreferencesSettings = useNotificationPreferences
export const useUpdateProfileSettings = useUpdateUserProfile
export const useUpdatePreferencesSettings = useUpdateNotificationPreferences
