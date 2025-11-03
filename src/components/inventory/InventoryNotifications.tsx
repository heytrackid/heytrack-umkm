'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, Package, ShoppingCart, X } from 'lucide-react'
import { uiLogger } from '@/lib/logger'
import type { NotificationsTable } from '@/types/database'

/**
 * Inventory Notifications Component
 * Displays inventory-related notifications and alerts
 */



type InventoryNotification = NotificationsTable & {
  metadata?: {
    ingredient_id?: string
    ingredient_name?: string
    current_stock?: number
    min_stock?: number
    recommended_quantity?: number
    severity?: string
  }
}

export const InventoryNotifications = () => {
  const [notifications, setNotifications] = useState<InventoryNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      void setLoading(true)
      const response = await fetch('/api/notifications?category=inventory&limit=10')

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      void setNotifications(data)
    } catch (err: unknown) {
      const error = err as Error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      void setError(errorMessage)
      uiLogger.error({ error }, 'Failed to fetch inventory notifications')
    } finally {
      void setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
      }
    } catch (err: unknown) {
      const error = err as Error
      uiLogger.error({ error, notificationId }, 'Failed to mark notification as read')
    }
  }

  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_dismissed: true })
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (err: unknown) {
      const error = err as Error
      uiLogger.error({ error, notificationId }, 'Failed to dismiss notification')
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <Package className="h-4 w-4 text-yellow-500" />
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p>Failed to load alerts</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p>No inventory alerts</p>
            <p className="text-sm">All items are well stocked</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${!notification.is_read ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-300' : 'bg-card'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {notification.priority && (
                            <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                          )}
                          {!notification.is_read && (
                            <Badge variant="outline" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        {notification.metadata && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {notification.metadata.ingredient_name && (
                              <p>Item: {notification.metadata.ingredient_name}</p>
                            )}
                            {notification.metadata.current_stock !== undefined && (
                              <p>Current Stock: {notification.metadata.current_stock}</p>
                            )}
                            {notification.metadata.recommended_quantity && (
                              <p>Suggested Order: {notification.metadata.recommended_quantity}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          {!notification.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          {notification.action_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = notification.action_url ?? ''}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
