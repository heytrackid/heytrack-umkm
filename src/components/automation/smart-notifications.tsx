'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface SmartNotification {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'inventory' | 'production' | 'financial' | 'order'
  title: string
  message: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
  read: boolean
  data?: any
}

// Lazy load components for code splitting
const NotificationPanel = dynamic(() => import('./NotificationPanel'), {
  loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />
})

const NotificationBell = dynamic(() => import('./NotificationBell'), {
  loading: () => <div className="animate-pulse bg-muted h-8 w-8 rounded" />
})

interface SmartNotificationsProps {
  className?: string
}

export default function SmartNotifications({ className }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch smart notifications
  useEffect(() => {
    fetchSmartNotifications()
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchSmartNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSmartNotifications = async () => {
    setLoading(true)
    try {
      // Lazy load heavy notification logic
      const { fetchNotificationData, generateAdditionalNotifications } = await import('./NotificationLogic')

      const { ingredients, orders } = await fetchNotificationData()

      // Only proceed if we have some data
      if (ingredients.length > 0 || orders.length > 0) {
        // Lazy load automation engine
        const { automationEngine } = await import('@/lib/automation-engine')

        // Generate smart notifications using automation engine
        const smartNotifications = automationEngine.notifications.generateSmartNotifications(
          ingredients,
          orders,
          {
            revenue: 0,
            grossProfit: 0,
            netProfit: 0,
            grossMargin: 0,
            netMargin: 0,
            inventoryValue: 0
          } // Default financial metrics
        )

        // Convert to our notification format
        const formattedNotifications: SmartNotification[] = smartNotifications.map((notif: any, index: number) => ({
          id: `smart-${Date.now()}-${index}`,
          type: notif.type,
          category: notif.category,
          title: notif.title,
          message: notif.message,
          action: notif.action,
          priority: notif.priority,
          timestamp: new Date(),
          read: false,
          data: notif.data
        }))

        // Add additional custom notifications
        const additionalNotifications = await generateAdditionalNotifications(ingredients, orders)

        setNotifications([...formattedNotifications, ...additionalNotifications])
      }
    } catch (error: any) {
      console.warn('Error fetching smart notifications (non-critical):', error)
      // Silently fail - notifications are not critical
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length

  return (
    <div className={`relative ${className}`}>
      <NotificationBell
        unreadCount={unreadCount}
        highPriorityCount={highPriorityCount}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onDismiss={dismissNotification}
          onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        />
      )}
    </div>
  )
}