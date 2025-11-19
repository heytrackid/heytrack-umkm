'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { useSupabase } from '@/providers/SupabaseProvider'

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
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = useCallback(async () => {
    if (!user) {return}
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const response = await res.json()
        setNotifications(response.data || [])
      }
    } catch (error) {
      logger.error(error, 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (error) {
      logger.error(error, 'Failed to mark notification as read')
      // Revert on error
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      toast.success('Semua notifikasi ditandai sudah dibaca')
    } catch (error) {
      logger.error(error, 'Failed to mark all notifications as read')
      fetchNotifications()
    }
  }

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }

    void fetchNotifications()

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          toast(newNotification.title, {
            description: newNotification.message,
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, supabase, fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, isLoading }}
    >
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
