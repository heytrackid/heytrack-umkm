'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { useNotifications as useNotificationsQuery, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/api/useNotifications'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  // const { user } = useAuth() // Not needed for notifications
  const { data: notifications = [], isLoading } = useNotificationsQuery()
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()


  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id)
  }

  const markAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync()
  }

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
