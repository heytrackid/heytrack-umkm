'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { automationEngine } from '@/lib/automation-engine'
import { uiLogger } from '@/lib/logger'
import { Ingredient } from '@/types'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  Calendar,
  CheckCircle,
  DollarSign,
  Factory,
  Package,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SmartNotification {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'inventory' | 'production' | 'financial' | 'orders' | 'system'
  title: string
  message: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
  read: boolean
  actionUrl?: string
  data?: any
}

interface SmartNotificationCenterProps {
  ingredients?: Ingredient[]
  orders?: Array<{ delivery_date: string; status: string }>
  financialMetrics?: { grossMargin: number; netMargin: number }
  onNotificationAction?: (notification: SmartNotification) => void
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
}

export default function SmartNotificationCenter({
  ingredients = [],
  orders = [],
  financialMetrics = { grossMargin: 0, netMargin: 0 },
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead
}: SmartNotificationCenterProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all')

  useEffect(() => {
    const generateNotificationsStable = () => {
      try {
        const smartNotifications = automationEngine.generateSmartNotifications(
          ingredients,
          orders,
          financialMetrics
        )

        // Convert to our notification format
        const formattedNotifications: SmartNotification[] = smartNotifications.map((notif, index: number) => ({
          id: `notif-${Date.now()}-${index}`,
          type: notif.type as SmartNotification['type'],
          category: notif.category as SmartNotification['category'],
          title: notif.title,
          message: notif.message,
          action: notif.action,
          priority: notif.priority,
          timestamp: new Date(),
          read: false
        }))

        // Add some additional smart notifications based on business logic
        const additionalNotifs = (() => {
          const additional: SmartNotification[] = []

          // Check for orders due today
          const today = new Date().toDateString()
          const todayOrders = orders.filter(o => new Date(o.delivery_date).toDateString() === today)

          if (todayOrders.length > 0) {
            additional.push({
              id: `today-orders-${Date.now()}`,
              type: 'warning',
              category: 'orders',
              title: `${todayOrders.length} Pesanan Hari Ini`,
              message: `Ada ${todayOrders.length} pesanan yang harus diselesaikan hari ini. Pastikan produksi berjalan sesuai jadwal.`,
              action: 'check_production',
              priority: 'high',
              timestamp: new Date(),
              read: false,
              actionUrl: '/production'
            })
          }

          // Check for weekend preparation
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          if (tomorrow.getDay() === 6) { // Saturday
            additional.push({
              id: `weekend-prep-${Date.now()}`,
              type: 'info',
              category: 'system',
              title: 'Persiapan Weekend',
              message: 'Besok weekend! Pastikan stok bahan cukup dan cek jadwal produksi untuk Senin.',
              action: 'check_inventory',
              priority: 'medium',
              timestamp: new Date(),
              read: false,
              actionUrl: '/inventory'
            })
          }

          // Performance celebration
          if (financialMetrics.grossMargin > 60) {
            additional.push({
              id: `good-performance-${Date.now()}`,
              type: 'success',
              category: 'financial',
              title: 'Performa Excellent! 🎉',
              message: `Margin kotor mencapai ${financialMetrics.grossMargin.toFixed(1)}%! Pertahankan kualitas dan efisiensi ini.`,
              priority: 'low',
              timestamp: new Date(),
              read: false
            })
          }

          return additional
        })()

        setNotifications(prev => {
          // Only update if notifications have actually changed to prevent loops
          const newNotifs = [...formattedNotifications, ...additionalNotifs]
          if (JSON.stringify(prev.map(n => ({ title: n.title, message: n.message }))) ===
            JSON.stringify(newNotifs.map(n => ({ title: n.title, message: n.message })))) {
            return prev
          }
          return newNotifs
        })

        // Play sound for critical notifications
        if (soundEnabled && formattedNotifications.some(n => n.type === 'critical')) {
          playNotificationSound('critical')
        }
      } catch (error: unknown) {
        uiLogger.error({ err: error }, 'Error generating notifications')
      }
    }

    generateNotificationsStable()
  }, [ingredients, orders, financialMetrics, soundEnabled])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Use a fresh timestamp for interval-based updates
      setNotifications(prev => {
        // Just update timestamps for existing notifications to show they're fresh
        return prev.map(notif => ({ ...notif, timestamp: new Date() }))
      })
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const playNotificationSound = (type: 'critical' | 'warning' | 'info') => {
    if (!soundEnabled) return

    // In a real app, you'd have audio files for different notification types
    const audio = new Audio('/notification-sound.mp3')
    audio.play().catch(() => {
      // Ignore audio play errors (user hasn't interacted with page yet)
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'success': return <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return <Package className="h-4 w-4" />
      case 'production': return <Factory className="h-4 w-4" />
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'orders': return <Calendar className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-gray-100 dark:bg-gray-800'
      case 'warning': return 'border-yellow-200 bg-gray-100 dark:bg-gray-800'
      case 'success': return 'border-green-200 bg-gray-100 dark:bg-gray-800'
      default: return 'border-blue-200 bg-gray-100 dark:bg-gray-800'
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    onMarkAsRead?.(notificationId)
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onMarkAllAsRead?.()
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleNotificationAction = (notification: SmartNotification) => {
    markAsRead(notification.id)
    onNotificationAction?.(notification)

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const filteredNotifications = notifications.filter(n =>
    selectedCategory === 'all' || n.category === selectedCategory
  )

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    critical: notifications.filter(n => n.type === 'critical').length,
    high: notifications.filter(n => n.priority === 'high').length
  }

  return (
    <div className="space-y-6">
      {/* Notification Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Smart Notification Center
              {stats.unread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.unread} Unread
                </Badge>
              )}
            </CardTitle>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Zap className={`h-4 w-4 ${autoRefresh ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`} />
                Auto
              </Button>
              {stats.unread > 0 && (
                <Button size="sm" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Notification Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
              <div className="text-xs text-muted-foreground">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.critical}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.high}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
          </div>

          {/* Category Filters */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications in this category</p>
                  </div>
                ) : (
                  filteredNotifications
                    .sort((a, b) => {
                      // Sort by priority then timestamp
                      const priorityOrder = { high: 3, medium: 2, low: 1 }
                      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
                      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0

                      if (aPriority !== bPriority) {
                        return bPriority - aPriority
                      }

                      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    })
                    .map((notification) => (
                      <Alert
                        key={notification.id}
                        className={`${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-blue-500' : ''
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2 mt-0.5">
                              {getNotificationIcon(notification.type)}
                              {getCategoryIcon(notification.category)}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{notification.title}</h4>
                                <Badge
                                  variant={
                                    notification.priority === 'high' ? 'destructive' :
                                      notification.priority === 'medium' ? 'secondary' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {notification.priority}
                                </Badge>
                                {!notification.read && (
                                  <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    New
                                  </Badge>
                                )}
                              </div>

                              <AlertDescription className="text-sm mb-2">
                                {notification.message}
                              </AlertDescription>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{notification.timestamp.toLocaleString()}</span>
                                <span className="capitalize">{notification.category}</span>
                              </div>

                              {notification.action && (
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleNotificationAction(notification)}
                                  >
                                    {notification.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Button>
                                  {!notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Mark Read
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Alert>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}