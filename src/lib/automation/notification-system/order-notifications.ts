import type { SmartNotification, OrderForNotification } from '@/lib/automation/notification-system/types'

/**
 * Order Notifications Module
 * Handles order-related notification generation
 */


export class OrderNotifications {
  /**
   * Generate order-related notifications
   */
  static generateOrderNotifications(orders: OrderForNotification[]): SmartNotification[] {
    const notifications: SmartNotification[] = []
    const now = new Date()

    // Urgent orders (within 24 hours)
    const urgentOrders = orders.filter(order => {
      const deliveryDate = new Date(order.delivery_date)
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && order['status'] !== 'DELIVERED'
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
      return deliveryDate < now && order['status'] !== 'DELIVERED' && order['status'] !== 'CANCELLED'
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
        order['status'] !== 'DELIVERED' &&
        order['status'] !== 'CANCELLED'
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
}
