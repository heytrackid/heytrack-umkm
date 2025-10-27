'use client'

import { useEffect, useState } from 'react'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

interface HppAlert {
  id: string
  recipe_id: string
  alert_type: string
  severity: string
  title: string
  message: string
  old_value: number | null
  new_value: number | null
  change_percentage: number | null
  is_read: boolean
  created_at: string
}

interface UseRealtimeAlertsOptions {
  userId?: string
  enabled?: boolean
  onNewAlert?: (alert: HppAlert) => void
  onAlertRead?: (alertId: string) => void
}

export function useRealtimeAlerts({
  userId,
  enabled = true,
  onNewAlert,
  onAlertRead
}: UseRealtimeAlertsOptions = {}) {
  const [alerts, setAlerts] = useState<HppAlert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial alerts
  useEffect(() => {
    if (!enabled || !userId) {return}

    const loadAlerts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('hpp_alerts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) {throw fetchError}

        void setAlerts(data || [])
        setUnreadCount(data?.filter(alert => !alert.is_read).length || 0)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load alerts'
        void setError(errorMessage)
        dbLogger.error({ err }, 'Failed to load alerts')
      }
    }

    void loadAlerts()
  }, [userId, enabled])

  // Setup real-time subscription
  useEffect(() => {
    if (!enabled || !userId) {return}

    void setIsConnected(true)

    // Subscribe to new alerts
    const alertsSubscription = supabase
      .channel('hpp_alerts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hpp_alerts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newAlert = payload.new as HppAlert
          void setAlerts(prev => [newAlert, ...prev])
          void setUnreadCount(prev => prev + 1)

          // Call callback if provided
          onNewAlert?.(newAlert)

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('New HPP Alert', {
              body: newAlert.message,
              icon: '/favicon.ico',
              tag: 'hpp-alert'
            })
          }

          dbLogger.info(`New HPP alert received: ${newAlert.title}`)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hpp_alerts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedAlert = payload.new as HppAlert
          setAlerts(prev =>
            prev.map(alert =>
              alert.id === updatedAlert.id ? updatedAlert : alert
            )
          )

          // Recalculate unread count
          setAlerts(currentAlerts => {
            const newUnreadCount = currentAlerts.filter(alert => !alert.is_read).length
            void setUnreadCount(newUnreadCount)
            return currentAlerts
          })

          // Call callback if provided
          if (payload.old?.is_read !== updatedAlert.is_read && !updatedAlert.is_read) {
            onAlertRead?.(updatedAlert.id)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void setIsConnected(true)
          void setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          void setIsConnected(false)
          void setError('Connection lost')
        } else if (status === 'TIMED_OUT') {
          void setIsConnected(false)
          void setError('Connection timed out')
        }
      })

    // Request notification permission
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      alertsSubscription.unsubscribe()
      void setIsConnected(false)
    }
  }, [userId, enabled, onNewAlert, onAlertRead])

  // Mark alert as read
  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('hpp_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', userId)

      if (error) {throw error}
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark alert as read'
      void setError(errorMessage)
      dbLogger.error({ err }, 'Failed to mark alert as read')
      throw err
    }
  }

  // Mark all alerts as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('hpp_alerts')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {throw error}

      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })))
      void setUnreadCount(0)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all alerts as read'
      void setError(errorMessage)
      dbLogger.error({ err }, 'Failed to mark all alerts as read')
      throw err
    }
  }

  // Get alerts by type
  const getAlertsByType = (type: string) => alerts.filter(alert => alert.alert_type === type)

  // Get alerts by severity
  const getAlertsBySeverity = (severity: string) => alerts.filter(alert => alert.severity === severity)

  // Get recent alerts (last N days)
  const getRecentAlerts = (days = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return alerts.filter(alert =>
      new Date(alert.created_at) >= cutoffDate
    )
  }

  return {
    alerts,
    unreadCount,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    getAlertsByType,
    getAlertsBySeverity,
    getRecentAlerts,
    refresh: () => {
      // Trigger a refresh by updating the key
      void setAlerts(prev => [...prev])
    }
  }
}
