'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Factory,
  Users,
  Calendar,
  Target,
  Zap,
  X,
  BellRing,
  Volume2,
  VolumeX
} from 'lucide-react'
import { automationEngine } from '@/lib/automation-engine'
import { Ingredient } from '@/types/database'

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

export function SmartNotificationCenter({
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
        // Ensure arrays are valid
        const safeIngredients = Array.isArray(ingredients) ? ingredients : []
        const safeOrders = Array.isArray(orders) ? orders : []
        
        const smartNotifications = automationEngine.generateSmartNotifications(
          safeIngredients, 
          safeOrders, 
          financialMetrics
        )

        // Convert to our notification format
        const formattedNotifications: SmartNotification[] = smartNotifications.map((notif, index) => ({
          id: `notif-${Date.now()}-${index}`,
          type: notif.type as any,
          category: notif.category as any,
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
          const todayOrders = safeOrders.filter(o => o.delivery_date && new Date(o.delivery_date).toDateString() === today)
          
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
      } catch (error) {
        console.error('Error generating notifications:', error)
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
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.unread}</div>
              <div className="text-xs text-muted-foreground">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.critical}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Semua', count: stats.total },
              { key: 'inventory', label: 'Inventory', count: notifications.filter(n => n.category === 'inventory').length },
              { key: 'production', label: 'Produksi', count: notifications.filter(n => n.category === 'production').length },
              { key: 'financial', label: 'Keuangan', count: notifications.filter(n => n.category === 'financial').length },
              { key: 'orders', label: 'Orders', count: notifications.filter(n => n.category === 'orders').length },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={selectedCategory === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(filter.key)}
                className="flex items-center gap-1"
              >
                {filter.key !== 'all' && getCategoryIcon(filter.key)}
                {filter.label}
                {filter.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filter.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts Banner */}
      {stats.critical > 0 && (
        <Alert className="border-red-200 bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <AlertDescription className="text-red-700">
            <strong>CRITICAL ALERTS!</strong> Ada {stats.critical} notifikasi kritis yang memerlukan perhatian segera.
          </AlertDescription>
        </Alert>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications
          .sort((a, b) => {
            // Sort by priority, then unread, then timestamp
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            if (a.priority !== b.priority) {
              return priorityOrder[b.priority] - priorityOrder[a.priority]
            }
            if (a.read !== b.read) {
              return a.read ? 1 : -1
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          })
          .map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover: ${getTypeColor(notification.type)} ${
                !notification.read ? 'border-l-4 border-l-primary' : 'opacity-75'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getNotificationIcon(notification.type)}
                      <span className="font-medium">{notification.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(notification.category)}
                        <span className="ml-1 capitalize">{notification.category}</span>
                      </Badge>
                      <Badge 
                        variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          NEW
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString('id-ID')}
                      </span>
                      
                      <div className="flex gap-2">
                        {notification.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNotificationAction(notification)}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Action
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
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
          ))}
        
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-green-700">
                All Clear! 🎉
              </h3>
              <p className="text-muted-foreground">
                {selectedCategory === 'all' 
                  ? 'Tidak ada notifikasi saat ini. Semua operasi berjalan lancar!'
                  : `Tidak ada notifikasi untuk kategori ${selectedCategory}.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions Panel */}
      {stats.critical > 0 || stats.high > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <Button variant="outline" size="sm" className="justify-start">
                <Package className="h-4 w-4 mr-2" />
                Check Inventory
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Factory className="h-4 w-4 mr-2" />
                Production Status
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Financial Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}