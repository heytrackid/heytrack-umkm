'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/shared/utilities'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  XCircle,
  User,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Activity
} from 'lucide-react'

// Notification Types
export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'inventory' | 'financial' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown>
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface NotificationCenterProps {
  notifications: NotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onAction?: (notification: NotificationItem) => void
  className?: string
}

export const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onAction,
  className = ""
}: NotificationCenterProps) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.read
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: NotificationItem['type']) => {
    const iconClass = "h-4 w-4"
    switch (type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, "text-gray-500")} />
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />
      case 'error':
        return <XCircle className={cn(iconClass, "text-red-500")} />
      case 'order':
        return <ShoppingCart className={cn(iconClass, "text-gray-500")} />
      case 'inventory':
        return <Package className={cn(iconClass, "text-orange-500")} />
      case 'financial':
        return <DollarSign className={cn(iconClass, "text-gray-500")} />
      case 'system':
        return <Settings className={cn(iconClass, "text-gray-500")} />
      default:
        return <Info className={cn(iconClass, "text-gray-500")} />
    }
  }

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-orange-200 bg-orange-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'unread' ? 'Show All' : 'Show Unread'}
            </Button>

            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  getPriorityColor(notification.priority),
                  !notification.read && "border-l-4"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium text-sm",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}

                      {notification.actionLabel && onAction && (
                        <Button
                          size="sm"
                          onClick={() => onAction(notification)}
                        >
                          {notification.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Toast Notification System
interface ToastNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}

export const ToastNotification = ({
  type,
  title,
  message,
  duration = 4000,
  onClose
}: ToastNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        void setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [duration, onClose])

  if (!isVisible) { return null }

  const getToastStyles = (): string => {
    switch (type) {
      case 'success':
        return 'border-gray-300 bg-gray-50 text-gray-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <XCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg",
      getToastStyles()
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && (
            <p className="text-sm mt-1 opacity-90">{message}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void setIsVisible(false)
            onClose?.()
          }}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="mt-3 h-1 bg-current opacity-20 rounded-full overflow-hidden">
          <div
            className="h-full bg-current animate-pulse"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Activity Feed Component
interface ActivityItem {
  id: string
  type: 'user' | 'order' | 'inventory' | 'financial' | 'system'
  title: string
  description: string
  timestamp: Date
  user?: {
    id: string
    name: string
    avatar?: string
  }
  metadata?: Record<string, unknown>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  onViewDetails?: (activity: ActivityItem) => void
  className?: string
}

export const ActivityFeed = ({
  activities,
  onViewDetails,
  className = ""
}: ActivityFeedProps) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4 text-gray-500" />
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-gray-500" />
      case 'inventory':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'financial':
        return <DollarSign className="h-4 w-4 text-gray-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user':
        return 'border-l-blue-500'
      case 'order':
        return 'border-l-green-500'
      case 'inventory':
        return 'border-l-orange-500'
      case 'financial':
        return 'border-l-purple-500'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/20",
                  getActivityColor(activity.type)
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {activity.user && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {activity.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {activity.user.name}
                            </span>
                          </div>
                        )}

                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(activity)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Alert Banner Component
interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  className?: string
}

export const AlertBanner = ({
  type,
  title,
  message,
  action,
  onClose,
  className = ""
}: AlertBannerProps) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'border-gray-300 bg-gray-50 text-gray-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'error':
        return <XCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <Alert className={cn(getAlertStyles(), className)}>
      {getIcon()}
      <AlertDescription>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium mb-1">{title}</h4>
            {message && <p className="text-sm">{message}</p>}
          </div>

          <div className="flex items-center gap-2">
            {action && (
              <Button size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )}

            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Notification Badge Component
interface NotificationBadgeProps {
  count: number
  maxCount?: number
  variant?: 'default' | 'dot'
  className?: string
}

export const NotificationBadge = ({
  count,
  maxCount = 99,
  variant = 'default',
  className = ""
}: NotificationBadgeProps) => {
  if (count === 0) { return null }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

  if (variant === 'dot') {
    return (
      <div className={cn(
        "absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full",
        className
      )} />
    )
  }

  return (
    <Badge
      variant="destructive"
      className={cn("min-w-[20px] h-5 flex items-center justify-center text-xs", className)}
    >
      {displayCount}
    </Badge>
  )
}
