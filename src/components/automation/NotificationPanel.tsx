'use client'

import { X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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

interface NotificationPanelProps {
  notifications: SmartNotification[]
  loading: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onMarkAllAsRead: () => void
}

export default function NotificationPanel({
  notifications,
  loading,
  onClose,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead
}: NotificationPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      case 'warning': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
      case 'success': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 md:hidden"
        onClick={onClose}
      />

      <div className="fixed md:absolute right-0 top-0 md:top-12 w-full md:w-[420px] h-full md:h-auto md:max-h-[600px] overflow-hidden bg-background border-l md:border border-border md:rounded-lg shadow-2xl z-50">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-base">Smart Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin" />
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {notifications.length === 0 ? (
            <div className="p-4 sm:p-6 text-center text-muted-foreground">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a7 7 0 0114 0v3l-5 5zM15 17v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m6 0H9" />
              </svg>
              <p className="text-sm sm:text-base">Tidak ada notifikasi</p>
              <p className="text-xs sm:text-sm">Sistem akan memberitahu jika ada yang perlu perhatian</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications
                .sort((a, b) => {
                  // Sort by priority then by timestamp
                  const priorityOrder = { high: 3, medium: 2, low: 1 }
                  if (a.priority !== b.priority) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                  }
                  return b.timestamp.getTime() - a.timestamp.getTime()
                })
                .map((notification) => (
                  <Card
                    key={notification.id}
                    className={`mx-3 my-2 ${getNotificationColor(notification.type)} ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-col gap-2">
                            <p className="font-medium text-sm leading-tight break-words">{notification.title}</p>
                            <div className="flex gap-1 flex-wrap">
                              <Badge
                                variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground break-words">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => onMarkAsRead(notification.id)}
                                >
                                  <span className="hidden sm:inline">Mark read</span>
                                  <span className="sm:hidden">✓</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400"
                                onClick={() => onDismiss(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-border flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
