/**
 * Order Cron Jobs Module
 * Scheduled jobs for order management and alerts
 */

import { createServiceRoleClient } from '@/utils/supabase'
import { cronLogger } from '@/lib/logger'
import { SmartNotificationSystem } from '@/lib/communications/notifications'
import type { NotificationAlert } from './types'

export class OrderCronJobs {
  /**
   * Check order deadlines and status updates
   */
  static async checkOrderDeadlines(): Promise<{ alertsGenerated: number }> {
    try {
      cronLogger.info({}, 'Running order deadline check')

      const supabase = createServiceRoleClient()
      const alerts: NotificationAlert[] = []

      // Check orders that should be ready for pickup/delivery
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: upcomingOrders } = await supabase
        .from('orders')
        .select('id, order_no, delivery_date, status')
        .eq('status', 'CONFIRMED')
        .lte('delivery_date', tomorrow.toISOString().split('T')[0])
        .limit(10)

      if (upcomingOrders && upcomingOrders.length > 0) {
        alerts.push({
          type: 'info',
          category: 'orders',
          priority: 'medium',
          title: `${upcomingOrders.length} Pesanan Siap Kirim`,
          message: `${upcomingOrders.length} pesanan siap untuk dikirim atau diambil.`,
          actionUrl: '/orders',
          actionLabel: 'Proses Pesanan',
          status: 'sent'
        })
      }

      // Send notifications
      for (const alert of alerts) {
        SmartNotificationSystem.getInstance().addNotification(alert)
      }

      return { alertsGenerated: alerts.length }
    } catch (err) {
      cronLogger.error({ err: _err instanceof Error ? err.message : String(err) }, 'Error checking order deadlines')
      throw err
    }
  }
}
