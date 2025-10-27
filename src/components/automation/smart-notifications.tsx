'use client'

import { useState, useEffect, memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
// import { automationEngine } from '@/lib/automation-engine'
import { AlertTriangle, Bell, CheckCircle, Info, X, Zap } from 'lucide-react'

import { apiLogger } from '@/lib/logger'
import type { NotificationData, Order, OrderItem, Ingredient } from '@/types'

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
  data?: NotificationData
}

interface SmartNotificationsProps {
  className?: string
}

const SmartNotifications = memo(({ className }: SmartNotificationsProps) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch smart notifications
  useEffect(() => {
    void fetchSmartNotifications()
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchSmartNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSmartNotifications = async () => {
    void setLoading(true)
    try {
      // Fetch data needed for automation engine analysis with timeout
      const fetchWithTimeout = (url: string, timeout = 5000) => Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])

      const [ingredientsRes, ordersRes] = await Promise.allSettled([
        fetchWithTimeout('/api/ingredients'),
        void fetchWithTimeout('/api/orders')
      ])

      // Extract data with fallback to empty arrays
      let ingredients: unknown[] = []
      let orders: unknown[] = []

      if (ingredientsRes.status === 'fulfilled' && ingredientsRes.value.ok) {
        try {
          const data = await ingredientsRes.value.json()
          ingredients = Array.isArray(data) ? data : []
        } catch (e) {
          apiLogger.warn({ error: e }, 'Failed to parse ingredients data')
        }
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        try {
          const data = await ordersRes.value.json()
          orders = Array.isArray(data) ? data : []
        } catch (e) {
          apiLogger.warn({ error: e }, 'Failed to parse orders data')
        }
      }

      // Only proceed if we have some data
      if (ingredients.length > 0 || orders.length > 0) {
        // Generate smart notifications using automation engine
        // const smartNotifications = automationEngine.notifications.generateSmartNotifications(
        //   ingredients,
        //   orders,
        //   {} // TODO: Implement real financial metrics fetching
        // )

        // Convert to our notification format
        // const formattedNotifications: SmartNotification[] = smartNotifications.map((notif: SmartNotification, index: number) => ({
        //   id: `smart-${Date.now()}-${index}`,
        //   type: notif.type,
        //   category: notif.category,
        //   title: notif.title,
        //   message: notif.message,
        //   action: notif.action,
        //   priority: notif.priority,
        //   timestamp: new Date(),
        //   read: false,
        //   data: notif.data
        // }))

        // Add additional custom notifications
        const additionalNotifications = await generateAdditionalNotifications(ingredients, orders)
        
        void setNotifications([...additionalNotifications])
      }
    } catch (err: unknown) {
      apiLogger.warn({ error }, 'Error fetching smart notifications (non-critical)')
      // Silently fail - notifications are not critical
    } finally {
      void setLoading(false)
    }
  }

  const generateAdditionalNotifications = async (ingredients: unknown[], orders: unknown[]): Promise<SmartNotification[]> => {
    const additional: SmartNotification[] = []

    // Check for orders with tight delivery schedules
    const urgentOrders = orders.filter((order: unknown): order is Order => {
      if (!order || typeof order !== 'object') {return false}
      const orderData = order as Order
      if (!orderData.delivery_date) {return false}
      const deliveryTime = new Date(orderData.delivery_date).getTime()
      const now = Date.now()
      const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && orderData.status !== 'DELIVERED'
    })

    if (urgentOrders.length > 0) {
      additional.push({
        id: `urgent-orders-${Date.now()}`,
        type: 'warning',
        category: 'order',
        title: `${urgentOrders.length} Pesanan Mendesak!`,
        message: `Ada ${urgentOrders.length} pesanan yang harus diselesaikan dalam 24 jam`,
        priority: 'high',
        timestamp: new Date(),
        read: false,
        data: { orders: urgentOrders }
      })
    }

    // Check for profitable vs unprofitable items
    const lowMarginCount = orders.filter((order: unknown): order is Order => {
      if (!order || typeof order !== 'object') {return false}
      const orderData = order as Order & { order_items?: OrderItem[] }
      return orderData.order_items?.some((item: OrderItem) => {
        const margin = item.unit_price > 0 ? ((item.unit_price - 5000) / item.unit_price) * 100 : 0
        return margin < 30
      }) ?? false
    }).length

    if (lowMarginCount > 0) {
      additional.push({
        id: `low-margin-${Date.now()}`,
        type: 'info',
        category: 'financial',
        title: 'Margin Keuntungan Perlu Perhatian',
        message: `${lowMarginCount} pesanan dengan margin rendah. Pertimbangkan review pricing`,
        priority: 'medium',
        timestamp: new Date(),
        read: false
      })
    }

    // HPP calculation recommendations
    const needsHPPReview = ingredients.filter((ing: unknown): ing is Ingredient => {
      if (!ing || typeof ing !== 'object') {return false}
      const ingData = ing as Ingredient
      return (ingData.current_stock ?? 0) > (ingData.min_stock ?? 0) * 2
    }).length
    if (needsHPPReview > 3) {
      additional.push({
        id: `hpp-review-${Date.now()}`,
        type: 'info',
        category: 'inventory',
        title: '💡 Optimasi Inventory Tersedia',
        message: `${needsHPPReview} bahan dengan stock berlebih. Pertimbangkan bundling atau menu spesial`,
        priority: 'low',
        timestamp: new Date(),
        read: false
      })
    }

    return additional
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map((notif: SmartNotification) => notif.id === id ? { ...notif, read: true } : notif)
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter((notif: SmartNotification) => notif.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
      case 'warning': return 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
      case 'success': return 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
      default: return 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
    }
  }

  const unreadCount = notifications.filter((n: SmartNotification) => !n.read).length
  const highPriorityCount = notifications.filter((n: SmartNotification) => !n.read && n.priority === 'high').length

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
        {highPriorityCount > 0 && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Smart Notifications Panel - Mobile-First Responsive */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:hidden" 
            onClick={() => setIsOpen(false)}
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
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {notifications.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-muted-foreground">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
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
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <span className="hidden sm:inline">Mark read</span>
                                    <span className="sm:hidden">✓</span>
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400"
                                  onClick={() => dismissNotification(notification.id)}
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
                onClick={() => setNotifications(prev => prev.map((n: SmartNotification) => ({ ...n, read: true })))}
              >
                Mark all as read
              </Button>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  )
})

export default SmartNotifications