import { formatCurrency } from '@/shared/utils/currency'

import { apiLogger } from '@/lib/logger'
/**
 * Smart Notification System
 * Context-aware business intelligence alerts dan notifications
 */

export interface SmartNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'inventory' | 'orders' | 'financial' | 'production' | 'customer' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data?: any
  actionUrl?: string
  actionLabel?: string
  isRead: boolean
  timestamp: string
  expiresAt?: string
}

export interface NotificationRule {
  id: string
  name: string
  category: SmartNotification['category']
  enabled: boolean
  conditions: {
    metric: string
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains'
    value: unknown
    timeWindow?: number // minutes
  }[]
  notification: {
    priority: SmartNotification['priority']
    title: string
    message: string
    actionUrl?: string
    actionLabel?: string
  }
}

export class SmartNotificationSystem {
  private static instance: SmartNotificationSystem
  private notifications: SmartNotification[] = []
  private rules: NotificationRule[] = []
  private subscribers: Array<(notifications: SmartNotification[]) => void> = []

  private constructor() {
    this.loadDefaultRules()
  }

  public static getInstance(): SmartNotificationSystem {
    if (!SmartNotificationSystem.instance) {
      SmartNotificationSystem.instance = new SmartNotificationSystem()
    }
    return SmartNotificationSystem.instance
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: (notifications: SmartNotification[]) => void) {
    this.subscribers.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  /**
   * Notify subscribers of changes
   */
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.notifications]))
  }

  /**
   * Add new notification
   */
  addNotification(notification: Omit<SmartNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    }

    // Add to beginning of array (newest first)
    this.notifications.unshift(newNotification)

    // Keep only last 100 notifications
    this.notifications = this.notifications.slice(0, 100)

    apiLogger.info('🔔 New notification:', newNotification.title)

    this.notifySubscribers()
    return newNotification
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      this.notifySubscribers()
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true)
    this.notifySubscribers()
  }

  /**
   * Get all notifications
   */
  getNotifications(): SmartNotification[] {
    return [...this.notifications]
  }

  /**
   * Get notifications by category
   */
  getNotificationsByCategory(category: SmartNotification['category']): SmartNotification[] {
    return this.notifications.filter(n => n.category === category)
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length
  }

  /**
   * Get notifications summary
   */
  getSummary() {
    const total = this.notifications.length
    const unread = this.getUnreadCount()
    const critical = this.notifications.filter(n => n.priority === 'critical').length
    const highPriority = this.notifications.filter(n => n.priority === 'high').length

    const byCategory = this.notifications.reduce((acc, notification) => {
      acc[notification.category] = (acc[notification.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      unread,
      critical,
      highPriority,
      byCategory
    }
  }

  /**
   * Process business metrics and generate smart notifications
   */
  async processBusinessMetrics(metrics: {
    inventory?: unknown[]
    orders?: unknown[]
    financial?: unknown
    production?: unknown[]
  }) {
    apiLogger.info('🧠 Processing business metrics for smart notifications...')

    // Process inventory metrics
    if (metrics.inventory) {
      await this.processInventoryMetrics(metrics.inventory)
    }

    // Process financial metrics
    if (metrics.financial) {
      await this.processFinancialMetrics(metrics.financial)
    }

    // Process order metrics
    if (metrics.orders) {
      await this.processOrderMetrics(metrics.orders)
    }

    // Clean up expired notifications
    this.cleanupExpiredNotifications()
  }

  /**
   * Process inventory metrics
   */
  private async processInventoryMetrics(inventory: unknown[]) {
    // Critical stock alerts
    const criticalItems = inventory.filter(item => 
      item.current_stock <= (item.min_stock * 0.3)
    )

    criticalItems.forEach(item => {
      this.addNotification({
        type: 'error',
        category: 'inventory',
        priority: 'critical',
        title: 'Stock Kritis!',
        message: `${item.name} tersisa ${item.current_stock} ${item.unit}. Segera restock!`,
        actionUrl: `/ingredients?search=${item.name}`,
        actionLabel: 'Lihat Bahan Baku',
        data: { ingredientId: item.id }
      })
    })

    // Low stock warnings
    const lowStockItems = inventory.filter(item => 
      item.current_stock <= item.min_stock && 
      item.current_stock > (item.min_stock * 0.3)
    )

    if (lowStockItems.length > 0) {
      this.addNotification({
        type: 'warning',
        category: 'inventory',
        priority: 'medium',
        title: 'Stock Menipis',
        message: `${lowStockItems.length} bahan baku mendekati batas minimum`,
        actionUrl: '/ingredients',
        actionLabel: 'Cek Bahan Baku'
      })
    }

    // Overstocked items
    const overstockedItems = inventory.filter(item => 
      item.current_stock > (item.min_stock * 5)
    )

    if (overstockedItems.length > 0) {
      this.addNotification({
        type: 'info',
        category: 'inventory',
        priority: 'low',
        title: 'Stock Berlebihan',
        message: `${overstockedItems.length} item memiliki stock berlebihan`,
        actionUrl: '/ingredients',
        actionLabel: 'Optimasi Stock'
      })
    }
  }

  /**
   * Process financial metrics
   */
  private async processFinancialMetrics(financial: any) {
    const { metrics } = financial

    // Low profit margin alert
    if (metrics.grossMargin < 25) {
      this.addNotification({
        type: 'warning',
        category: 'financial',
        priority: 'high',
        title: 'Margin Keuntungan Rendah',
        message: `Margin kotor hanya ${metrics.grossMargin.toFixed(1)}%. Pertimbangkan menaikkan harga atau efisiensi cost.`,
        actionUrl: '/profit',
        actionLabel: 'Analisis Laba',
        data: { grossMargin: metrics.grossMargin }
      })
    }

    // Negative profit alert
    if (metrics.netProfit < 0) {
      this.addNotification({
        type: 'error',
        category: 'financial',
        priority: 'critical',
        title: 'Kerugian Terdeteksi',
        message: `Bisnis mengalami kerugian ${formatCurrency(Math.abs(metrics.netProfit))} bulan ini`,
        actionUrl: '/profit',
        actionLabel: 'Review Laporan'
      })
    }

    // High inventory value vs revenue ratio
    if (metrics.revenue > 0 && (metrics.inventoryValue / metrics.revenue) > 0.5) {
      this.addNotification({
        type: 'warning',
        category: 'financial',
        priority: 'medium',
        title: 'Inventory Value Tinggi',
        message: 'Nilai inventory terlalu tinggi dibanding revenue. Pertimbangkan optimasi stock.',
        actionUrl: '/cash-flow',
        actionLabel: 'Analisis Arus Kas'
      })
    }
  }

  /**
   * Process order metrics
   */
  private async processOrderMetrics(orders: unknown[]) {
    // Urgent orders (delivery in < 24 hours)
    const urgentOrders = orders.filter(order => {
      if (!order.delivery_date || order.status === 'DELIVERED') return false
      
      const deliveryTime = new Date(order.delivery_date).getTime()
      const now = Date.now()
      const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60)
      
      return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0
    })

    if (urgentOrders.length > 0) {
      this.addNotification({
        type: 'warning',
        category: 'orders',
        priority: 'high',
        title: 'Pesanan Mendesak',
        message: `${urgentOrders.length} pesanan harus selesai dalam 24 jam`,
        actionUrl: '/orders?filter=urgent',
        actionLabel: 'Lihat Pesanan',
        data: { urgentCount: urgentOrders.length }
      })
    }

    // Overdue orders
    const overdueOrders = orders.filter(order => {
      if (!order.delivery_date || order.status === 'DELIVERED') return false
      
      const deliveryTime = new Date(order.delivery_date).getTime()
      const now = Date.now()
      
      return deliveryTime < now
    })

    if (overdueOrders.length > 0) {
      this.addNotification({
        type: 'error',
        category: 'orders',
        priority: 'critical',
        title: 'Pesanan Terlambat',
        message: `${overdueOrders.length} pesanan melewati batas waktu delivery`,
        actionUrl: '/orders?filter=overdue',
        actionLabel: 'Handle Overdue'
      })
    }
  }

  /**
   * Clean up expired notifications
   */
  private cleanupExpiredNotifications() {
    const now = Date.now()
    const initialCount = this.notifications.length

    this.notifications = this.notifications.filter(notification => {
      if (!notification.expiresAt) return true
      return new Date(notification.expiresAt).getTime() > now
    })

    const removedCount = initialCount - this.notifications.length
    if (removedCount > 0) {
      apiLogger.info(`🧹 Cleaned up ${removedCount} expired notifications`)
      this.notifySubscribers()
    }
  }

  /**
   * Load default notification rules
   */
  private loadDefaultRules() {
    this.rules = [
      {
        id: 'critical_stock',
        name: 'Critical Stock Alert',
        category: 'inventory',
        enabled: true,
        conditions: [
          {
            metric: 'stock_ratio',
            operator: 'lt',
            value: 0.3
          }
        ],
        notification: {
          priority: 'critical',
          title: 'Stock Kritis',
          message: 'Ada bahan baku yang hampir habis',
          actionUrl: '/inventory',
          actionLabel: 'Cek Stock'
        }
      },
      {
        id: 'low_profit_margin',
        name: 'Low Profit Margin Alert',
        category: 'financial',
        enabled: true,
        conditions: [
          {
            metric: 'gross_margin',
            operator: 'lt',
            value: 25
          }
        ],
        notification: {
          priority: 'high',
          title: 'Margin Rendah',
          message: 'Profit margin di bawah target',
          actionUrl: '/finance',
          actionLabel: 'Review Pricing'
        }
      }
    ]
  }

  /**
   * Get notification rules
   */
  getRules(): NotificationRule[] {
    return [...this.rules]
  }

  /**
   * Toggle notification rule
   */
  toggleRule(ruleId: string, enabled: boolean) {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
      apiLogger.info(`🔔 Rule ${rule.name} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }
}

// Export singleton instance
export const smartNotificationSystem = SmartNotificationSystem.getInstance()

// Utility functions
export const addBusinessAlert = (
  title: string, 
  message: string, 
  category: SmartNotification['category'], 
  priority: SmartNotification['priority'] = 'medium',
  actionUrl?: string
) => {
  return smartNotificationSystem.addNotification({
    type: priority === 'critical' ? 'error' : priority === 'high' ? 'warning' : 'info',
    category,
    priority,
    title,
    message,
    actionUrl
  })
}

export const getBusinessAlerts = () => {
  return smartNotificationSystem.getNotifications()
}

export const getAlertsSummary = () => {
  return smartNotificationSystem.getSummary()
}

export default smartNotificationSystem