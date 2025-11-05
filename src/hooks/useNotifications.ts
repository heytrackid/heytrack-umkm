'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  type Notification, 
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES 
} from '@/lib/notifications/notification-types'
import { detectAllNotifications } from '@/lib/notifications/notification-detector'
import { useIngredients } from './useIngredients'
import type { Row } from '@/types/database'

const STORAGE_KEY = 'heytrack_notifications'
const PREFERENCES_KEY = 'heytrack_notification_preferences'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES)
  const { data: ingredients } = useIngredients()
  const [orders, setOrders] = useState<Row<'orders'>[]>([])

  // Load saved notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setNotifications(parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })))
      } catch (_e) {
        // Invalid data, ignore
      }
    }

    const savedPrefs = localStorage.getItem(PREFERENCES_KEY)
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs))
      } catch (_e) {
        // Invalid data, use defaults
      }
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  // Load orders (in real app, use useOrders hook)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          credentials: 'include', // Include cookies for authentication
        })
        if (response.ok) {
          const data = await response.json()
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch (_e) {
        // Silently fail
      }
    }

    if (preferences.enabled) {
      void fetchOrders()
    }
  }, [preferences.enabled])

  // Check for new notifications periodically
  useEffect(() => {
    if (!preferences.enabled) {return}

    const checkNotifications = () => {
      const newNotifications = detectAllNotifications({
        ingredients: ingredients ?? [],
        orders: orders ?? []
      })

      // Filter by preferences
      const filtered = newNotifications.filter(n => {
        // Check if type is enabled
        if (!preferences.types[n.type]) {return false}
        
        // Check priority
        const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 }
        const minPriorityLevel = priorityOrder[preferences.minPriority]
        const notifPriorityLevel = priorityOrder[n.priority]
        
        return notifPriorityLevel >= minPriorityLevel
      })

      // Merge with existing, avoid duplicates
      setNotifications(prev => {
        const existing = new Set(prev.map(n => `${n.type}-${n.metadata?.itemId}`))
        const toAdd = filtered.filter(n => !existing.has(`${n.type}-${n.metadata?.itemId}`))
        
        // Keep only last 50 notifications
        return [...toAdd, ...prev].slice(0, 50)
      })

      // Play sound if enabled and has new critical/high priority
      if (preferences.soundEnabled && filtered.some(n => n.priority === 'critical' || n.priority === 'high')) {
        playNotificationSound()
      }
    }

    // Initial check
    checkNotifications()

    // Periodic check
    const interval = setInterval(checkNotifications, preferences.checkInterval * 60 * 1000)

    return () => clearInterval(interval)
  }, [ingredients, orders, preferences])

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  // Add custom notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `custom-${Date.now()}`,
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length
  const criticalCount = notifications.filter(n => !n.read && n.priority === 'critical').length

  return {
    notifications,
    unreadCount,
    criticalCount,
    preferences,
    markAsRead,
    markAllAsRead,
    clearAll,
    updatePreferences,
    addNotification
  }
}

let notificationAudioContext: AudioContext | null = null

// Play notification sound (simple beep)
function playNotificationSound() {
  try {
    // Create simple beep sound using Web Audio API
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      return
    }

    if (!notificationAudioContext || notificationAudioContext.state === 'closed') {
      notificationAudioContext = new AudioContextCtor()
    }

    const audioContext = notificationAudioContext

    if (!audioContext) {
      return
    }

    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  } catch (_e) {
    // Browser doesn't support Web Audio API
  }
}
