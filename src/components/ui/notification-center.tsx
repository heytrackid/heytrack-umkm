'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  BellRing, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success' | 'alert'
  category: string
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_read: boolean
  created_at: string
  action_url?: string
}

interface NotificationCenterProps {
  className?: string
  showUnreadOnly?: boolean
}

const NotificationIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
  alert: BellRing
}

const NotificationColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500', 
  error: 'text-red-500',
  success: 'text-green-500',
  alert: 'text-purple-500'
}

const PriorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export default function NotificationCenter({ className, showUnreadOnly = false }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams({
        limit: '10',
        ...(showUnreadOnly && { unread_only: 'true' })
      })
      
      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.data || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications?action=mark_read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: notificationIds })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, is_read: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications?action=dismiss', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [notificationId] })
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [showUnreadOnly])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID')
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {!showUnreadOnly && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const unreadIds = notifications
                  .filter(n => !n.is_read)
                  .map(n => n.id)
                markAsRead(unreadIds)
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = NotificationIcons[notification.type]
              const iconColor = NotificationColors[notification.type]
              const priorityStyle = PriorityColors[notification.priority]
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.is_read 
                      ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 '
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${iconColor} p-1`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium text-sm ${
                            notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            notification.is_read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${priorityStyle}`}>
                          {notification.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs h-6 px-2"
                          onClick={() => markAsRead([notification.id])}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}