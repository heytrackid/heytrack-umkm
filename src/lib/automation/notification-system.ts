import {
  AutomationConfig,
  Ingredient,
  OrderForNotification,
  SmartNotification,
  FinancialMetrics
} from './types'

export class NotificationSystem {
  constructor(private config: AutomationConfig) {}

  /**
   * 🔔 NOTIFICATION SYSTEM: Smart Alerts
   */
  generateSmartNotifications(
    inventory: Ingredient[],
    orders: OrderForNotification[],
    financialMetrics: FinancialMetrics
  ): SmartNotification[] {
    const notifications: SmartNotification[] = []

    // Ensure inventory is an array
    const safeInventory = Array.isArray(inventory) ? inventory : []
    const safeOrders = Array.isArray(orders) ? orders : []

    // Add inventory notifications
    notifications.push(...this.generateInventoryNotifications(safeInventory))
    
    // Add order notifications
    notifications.push(...this.generateOrderNotifications(safeOrders))
    
    // Add financial notifications
    notifications.push(...this.generateFinancialNotifications(financialMetrics))

    // Sort by priority and timestamp
    return notifications
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        
        if (priorityDiff !== 0) return priorityDiff
        
        // If same priority, sort by timestamp (newer first)
        const aTime = a.timestamp?.getTime() || 0
        const bTime = b.timestamp?.getTime() || 0
        return bTime - aTime
      })
      .slice(0, 20) // Limit to 20 most important notifications
  }

  /**
   * Generate inventory-related notifications
   */
  private generateInventoryNotifications(inventory: Ingredient[]): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()

    inventory.forEach(ingredient => {
      // Critical stock level
      if (ingredient.current_stock <= ingredient.min_stock * 0.5) {
        notifications.push({
          type: 'critical',
          category: 'inventory',
          title: `Stok ${ingredient.name} KRITIS!`,
          message: `Tersisa ${ingredient.current_stock} ${ingredient.unit}. Segera restock untuk menghindari kehabisan.`,
          action: 'reorder_ingredient',
          priority: 'high',
          timestamp: now,
          data: {
            ingredientId: ingredient.id,
            currentStock: ingredient.current_stock,
            minStock: ingredient.min_stock,
            unit: ingredient.unit
          }
        })
      }
      // Low stock level
      else if (ingredient.current_stock <= ingredient.min_stock) {
        notifications.push({
          type: 'warning',
          category: 'inventory',
          title: `Stok ${ingredient.name} Menipis`,
          message: `Stok tersisa ${ingredient.current_stock} ${ingredient.unit}. Pertimbangkan untuk restock.`,
          action: 'review_inventory',
          priority: 'medium',
          timestamp: now,
          data: {
            ingredientId: ingredient.id,
            currentStock: ingredient.current_stock,
            minStock: ingredient.min_stock,
            unit: ingredient.unit
          }
        })
      }
      // Overstocked
      else if (ingredient.current_stock > ingredient.min_stock * 4) {
        notifications.push({
          type: 'info',
          category: 'inventory',
          title: `${ingredient.name} Overstocked`,
          message: `Stok ${ingredient.current_stock} ${ingredient.unit} mungkin berlebihan. Pertimbangkan untuk mengurangi pembelian.`,
          action: 'optimize_inventory',
          priority: 'low',
          timestamp: now,
          data: {
            ingredientId: ingredient.id,
            currentStock: ingredient.current_stock,
            recommendedMax: ingredient.min_stock * 3
          }
        })
      }
    })

    // Overall inventory health
    const lowStockCount = inventory.filter(ing => ing.current_stock <= ing.min_stock).length
    const criticalStockCount = inventory.filter(ing => ing.current_stock <= ing.min_stock * 0.5).length
    
    if (criticalStockCount > 3) {
      notifications.push({
        type: 'critical',
        category: 'inventory',
        title: 'Krisis Stok Multiple Items!',
        message: `${criticalStockCount} bahan dalam kondisi stok kritis. Perlu restock segera.`,
        action: 'bulk_reorder',
        priority: 'high',
        timestamp: now,
        data: { criticalCount: criticalStockCount }
      })
    } else if (lowStockCount > 5) {
      notifications.push({
        type: 'warning',
        category: 'inventory',
        title: 'Multiple Items Low Stock',
        message: `${lowStockCount} bahan memiliki stok rendah. Review kebutuhan restock.`,
        action: 'review_multiple_inventory',
        priority: 'medium',
        timestamp: now,
        data: { lowStockCount }
      })
    }

    return notifications
  }

  /**
   * Generate order-related notifications
   */
  private generateOrderNotifications(orders: OrderForNotification[]): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()

    // Urgent orders (within 24 hours)
    const urgentOrders = orders.filter(order => {
      const deliveryDate = new Date(order.delivery_date)
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && order.status !== 'DELIVERED'
    })

    urgentOrders.forEach(order => {
      const deliveryDate = new Date(order.delivery_date)
      const hoursUntilDelivery = Math.round((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      notifications.push({
        type: 'warning',
        category: 'production',
        title: 'Pesanan Mendesak!',
        message: `Pesanan harus selesai dalam ${hoursUntilDelivery} jam. Pastikan produksi sudah dimulai.`,
        action: 'check_production',
        priority: 'high',
        timestamp: now,
        data: {
          orderId: order.delivery_date, // Using delivery_date as ID since we don't have order ID
          hoursRemaining: hoursUntilDelivery,
          deliveryDate: order.delivery_date
        }
      })
    })

    // Overdue orders
    const overdueOrders = orders.filter(order => {
      const deliveryDate = new Date(order.delivery_date)
      return deliveryDate < now && order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
    })

    if (overdueOrders.length > 0) {
      notifications.push({
        type: 'critical',
        category: 'orders',
        title: 'Pesanan Terlambat!',
        message: `${overdueOrders.length} pesanan melewati batas waktu pengiriman. Perlu tindakan segera.`,
        action: 'handle_overdue_orders',
        priority: 'high',
        timestamp: now,
        data: { overdueCount: overdueOrders.length }
      })
    }

    // Daily production planning
    const todayOrders = orders.filter(order => {
      const deliveryDate = new Date(order.delivery_date)
      const today = new Date()
      return deliveryDate.toDateString() === today.toDateString() && 
             order.status !== 'DELIVERED' && 
             order.status !== 'CANCELLED'
    })

    if (todayOrders.length > 5) {
      notifications.push({
        type: 'info',
        category: 'production',
        title: 'Hari Sibuk Hari Ini',
        message: `${todayOrders.length} pesanan harus selesai hari ini. Pastikan kapasitas produksi memadai.`,
        action: 'plan_production',
        priority: 'medium',
        timestamp: now,
        data: { todayOrderCount: todayOrders.length }
      })
    }

    return notifications
  }

  /**
   * Generate financial-related notifications
   */
  private generateFinancialNotifications(financialMetrics: FinancialMetrics): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()

    // Low profitability alert
    if (financialMetrics.grossMargin < this.config.lowProfitabilityThreshold) {
      notifications.push({
        type: 'warning',
        category: 'financial',
        title: 'Margin Keuntungan Rendah',
        message: `Margin kotor hanya ${financialMetrics.grossMargin.toFixed(1)}%. Pertimbangkan menaikkan harga atau efisiensi cost.`,
        action: 'review_pricing',
        priority: 'medium',
        timestamp: now,
        data: {
          currentMargin: financialMetrics.grossMargin,
          threshold: this.config.lowProfitabilityThreshold
        }
      })
    }

    // Negative profit alert
    if (financialMetrics.netProfit < 0) {
      notifications.push({
        type: 'critical',
        category: 'financial',
        title: 'Kerugian Operasional',
        message: `Bisnis mengalami kerugian Rp ${Math.abs(financialMetrics.netProfit).toLocaleString()}. Perlu analisis segera.`,
        action: 'analyze_losses',
        priority: 'high',
        timestamp: now,
        data: { netLoss: Math.abs(financialMetrics.netProfit) }
      })
    }

    // Excellent performance
    else if (financialMetrics.netMargin > 25) {
      notifications.push({
        type: 'success',
        category: 'financial',
        title: 'Performa Finansial Excellent!',
        message: `Net margin ${financialMetrics.netMargin.toFixed(1)}% sangat baik. Pertimbangkan ekspansi.`,
        action: 'consider_expansion',
        priority: 'low',
        timestamp: now,
        data: { netMargin: financialMetrics.netMargin }
      })
    }

    // High inventory value relative to revenue
    if (financialMetrics.revenue > 0) {
      const inventoryTurnover = financialMetrics.inventoryValue / financialMetrics.revenue
      if (inventoryTurnover > 2) {
        notifications.push({
          type: 'warning',
          category: 'financial',
          title: 'Inventory Value Tinggi',
          message: `Nilai inventory ${inventoryTurnover.toFixed(1)}x dari revenue bulanan. Optimasi diperlukan.`,
          action: 'optimize_inventory_value',
          priority: 'medium',
          timestamp: now,
          data: { 
            inventoryTurnover,
            inventoryValue: financialMetrics.inventoryValue,
            revenue: financialMetrics.revenue
          }
        })
      }
    }

    return notifications
  }

  /**
   * Generate maintenance reminders
   */
  generateMaintenanceNotifications(
    equipment: Array<{ name: string; lastMaintenance: string; intervalDays: number }>
  ): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()

    equipment.forEach(item => {
      const lastMaintenance = new Date(item.lastMaintenance)
      const daysSinceLastMaintenance = Math.floor((now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastMaintenance >= item.intervalDays) {
        notifications.push({
          type: 'warning',
          category: 'production',
          title: 'Maintenance Equipment',
          message: `${item.name} perlu maintenance (terakhir ${daysSinceLastMaintenance} hari lalu).`,
          action: 'schedule_maintenance',
          priority: 'medium',
          timestamp: now,
          data: {
            equipmentName: item.name,
            daysSinceMaintenance: daysSinceLastMaintenance,
            interval: item.intervalDays
          }
        })
      } else if (daysSinceLastMaintenance >= item.intervalDays * 0.8) {
        // Upcoming maintenance reminder
        const daysUntilMaintenance = item.intervalDays - daysSinceLastMaintenance
        notifications.push({
          type: 'info',
          category: 'production',
          title: 'Maintenance Reminder',
          message: `${item.name} akan perlu maintenance dalam ${daysUntilMaintenance} hari.`,
          action: 'plan_maintenance',
          priority: 'low',
          timestamp: now,
          data: {
            equipmentName: item.name,
            daysUntilMaintenance
          }
        })
      }
    })

    return notifications
  }

  /**
   * Generate seasonal business notifications
   */
  generateSeasonalNotifications(): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12
    const day = now.getDate()

    // Holiday season preparations
    const holidays = [
      { name: 'Lebaran', months: [5, 6], message: 'Persiapkan produk lebaran dan stok ekstra' },
      { name: 'Natal', months: [12], message: 'Season kue natal - tingkatkan produksi cake dan cookies' },
      { name: 'Tahun Baru', months: [12, 1], message: 'Persiapan celebration cake untuk tahun baru' },
      { name: 'Valentine', months: [2], message: 'Valentine season - fokus pada cake romantis dan coklat' }
    ]

    holidays.forEach(holiday => {
      if (holiday.months.includes(month)) {
        notifications.push({
          type: 'info',
          category: 'production',
          title: `${holiday.name} Season`,
          message: holiday.message,
          action: 'plan_seasonal_production',
          priority: 'medium',
          timestamp: now,
          data: { season: holiday.name, month }
        })
      }
    })

    // Weather-based notifications
    if (month >= 10 || month <= 3) { // Rainy season
      notifications.push({
        type: 'info',
        category: 'inventory',
        title: 'Musim Hujan',
        message: 'Pastikan penyimpanan bahan kering terlindungi dari kelembaban.',
        action: 'check_storage',
        priority: 'low',
        timestamp: now,
        data: { season: 'rainy' }
      })
    }

    return notifications
  }

  /**
   * Filter notifications based on user preferences
   */
  filterNotifications(
    notifications: SmartNotification[],
    userPreferences: {
      enableInventory?: boolean
      enableFinancial?: boolean
      enableProduction?: boolean
      enableOrders?: boolean
      minPriority?: 'low' | 'medium' | 'high'
    }
  ): SmartNotification[] {
    return notifications.filter(notification => {
      // Category filter
      if (notification.category === 'inventory' && !userPreferences.enableInventory) return false
      if (notification.category === 'financial' && !userPreferences.enableFinancial) return false
      if (notification.category === 'production' && !userPreferences.enableProduction) return false
      if (notification.category === 'orders' && !userPreferences.enableOrders) return false

      // Priority filter
      if (userPreferences.minPriority) {
        const priorityOrder = { low: 1, medium: 2, high: 3 }
        const minPriorityLevel = priorityOrder[userPreferences.minPriority]
        const notificationPriorityLevel = priorityOrder[notification.priority]
        
        if (notificationPriorityLevel < minPriorityLevel) return false
      }

      return true
    })
  }

  /**
   * Mark notifications as read/dismissed
   */
  dismissNotification(notificationId: string): boolean {
    // This would typically update a database or state management system
    // For now, we'll just return true to indicate success
    console.log(`Notification ${notificationId} dismissed`)
    return true
  }

  /**
   * Get notification summary for dashboard
   */
  getNotificationSummary(notifications: SmartNotification[]) {
    return {
      total: notifications.length,
      critical: notifications.filter(n => n.type === 'critical').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      info: notifications.filter(n => n.type === 'info').length,
      success: notifications.filter(n => n.type === 'success').length,
      byCategory: {
        inventory: notifications.filter(n => n.category === 'inventory').length,
        production: notifications.filter(n => n.category === 'production').length,
        financial: notifications.filter(n => n.category === 'financial').length,
        orders: notifications.filter(n => n.category === 'orders').length
      },
      urgent: notifications.filter(n => n.priority === 'high').length
    }
  }
}