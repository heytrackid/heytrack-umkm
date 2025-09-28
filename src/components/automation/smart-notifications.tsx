'use client'

import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { automationEngine } from '@/lib/automation-engine'

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
      // Fetch data needed for automation engine analysis
      const [ingredientsRes, ordersRes] = await Promise.all([
        fetch('/api/ingredients'),
        fetch('/api/orders?limit=50')
      ])

      if (ingredientsRes.ok && ordersRes.ok) {
        const ingredientsData = await ingredientsRes.json()
        const ordersData = await ordersRes.json()
        
        // Ensure data is in array format
        const ingredients = Array.isArray(ingredientsData) ? ingredientsData : []
        const orders = Array.isArray(ordersData) ? ordersData : []
        
        // Generate smart notifications using automation engine
        const smartNotifications = automationEngine.generateSmartNotifications(
          ingredients,
          orders,
          { grossMargin: 45, netMargin: 25 } // Mock financial metrics for now
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
    } catch (error) {
      console.error('Error fetching smart notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAdditionalNotifications = async (ingredients: any[], orders: any[]): Promise<SmartNotification[]> => {
    const additional: SmartNotification[] = []

    // Check for orders with tight delivery schedules
    const urgentOrders = orders.filter(order => {
      if (!order.delivery_date) return false
      const deliveryTime = new Date(order.delivery_date).getTime()
      const now = Date.now()
      const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && order.status !== 'DELIVERED'
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
    const lowMarginCount = orders.filter(order => {
      return order.order_items?.some((item: any) => {
        const margin = item.unit_price > 0 ? ((item.unit_price - 5000) / item.unit_price) * 100 : 0
        return margin < 30
      })
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
    const needsHPPReview = ingredients.filter(ing => ing.stock > ing.min_stock * 2).length
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
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
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
      case 'critical': return 'border-red-200 bg-gray-100 dark:bg-gray-800'
      case 'warning': return 'border-orange-200 bg-orange-50'
      case 'success': return 'border-green-200 bg-gray-100 dark:bg-gray-800'
      default: return 'border-blue-200 bg-gray-100 dark:bg-gray-800'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length

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
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-gray-100 dark:bg-gray-8000 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Smart Notifications Panel - Mobile-First Responsive */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-[95vw] sm:w-96 max-h-[85vh] sm:max-h-96 overflow-hidden bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-sm sm:text-base">Smart Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                {loading && (
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
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
                      className={`mx-2 mb-2 ${getNotificationColor(notification.type)} ${
                        notification.read ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <div className="flex gap-1">
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
                            <p className="text-xs text-muted-foreground">
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
            <div className="p-3 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}