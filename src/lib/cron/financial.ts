/**
 * Financial Cron Jobs Module
 * Scheduled jobs for financial alerts and monitoring
 */

import { createServiceRoleClient } from '@/utils/supabase'
import { cronLogger } from '@/lib/logger'
import { SmartNotificationSystem } from '@/lib/communications/notifications'
import type { NotificationAlert } from './types'

export class FinancialCronJobs {
  /**
   * Check financial alerts (overdue payments, budget limits)
   */
  static async checkFinancialAlerts(): Promise<{ alertsGenerated: number }> {
    try {
      cronLogger.info({}, 'Running financial alerts check')

      const supabase = createServiceRoleClient()
      const alerts: NotificationAlert[] = []

      // Check overdue payments (simplified)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: overdueOrders } = await supabase
        .from('orders')
        .select('id, order_no, total_amount, created_at')
        .eq('status', 'PENDING')
        .lt('created_at', thirtyDaysAgo.toISOString())
        .limit(10)

      if (overdueOrders && overdueOrders.length > 0) {
        alerts.push({
          type: 'warning',
          category: 'financial',
          priority: 'high',
          title: `${overdueOrders.length} Pembayaran Tertunda`,
          message: `${overdueOrders.length} pesanan belum dibayar lebih dari 30 hari.`,
          actionUrl: '/orders',
          actionLabel: 'Cek Pesanan',
          status: 'sent'
        })
      }

      // Send notifications
      for (const alert of alerts) {
        SmartNotificationSystem.getInstance().addNotification(alert)
      }

      return { alertsGenerated: alerts.length }
    } catch (err) {
      cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'Error checking financial alerts')
      throw err
    }
  }
}
