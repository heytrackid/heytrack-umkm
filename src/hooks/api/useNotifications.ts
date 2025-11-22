import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handling'
import { fetchApi, postApi, patchApi } from '@/lib/query/query-helpers'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  link?: string
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: (): Promise<Notification[]> => fetchApi<Notification[]>('/api/notifications'),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => patchApi('/api/notifications', { id }),
    onSuccess: () => {
      // Invalidate and refetch notifications
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => handleError(error, 'Mark notification as read', true, 'Gagal menandai notifikasi sebagai sudah dibaca'),
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => postApi('/api/notifications/mark-all-read'),
    onSuccess: () => {
      // Invalidate and refetch notifications
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: (error) => handleError(error, 'Mark all notifications as read', true, 'Gagal menandai semua notifikasi sebagai sudah dibaca'),
  })
}