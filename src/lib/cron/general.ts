/**
 * General Cron Jobs Module
 * General automation and maintenance cron jobs
 * SERVER-ONLY: Uses service role client for automated tasks
 */

import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { cronLogger } from '@/lib/logger'
import { InventoryCronJobs } from './inventory'
import { FinancialCronJobs } from './financial'
import { OrderCronJobs } from './orders'
import { HPPCronJobs } from './hpp'
import type { AutomationEngineResult, AutomationStatus } from './types'
import type { Database } from '@/types/supabase-generated'

export class GeneralCronJobs {
  /**
   * Run automation engine
   */
  static async runAutomationEngine(): Promise<AutomationEngineResult> {
    try {
      cronLogger.info({}, 'Running automation engine')

      // Run various automated tasks
      const results = await Promise.allSettled([
        InventoryCronJobs.checkInventoryReorder(),
        FinancialCronJobs.checkFinancialAlerts(),
        OrderCronJobs.checkOrderDeadlines(),
        HPPCronJobs.detectHPPAlertsForAllUsers()
      ])

      const summary: AutomationEngineResult = {
        inventory: results[0].status === 'fulfilled' ? results[0].value : null,
        financial: results[1].status === 'fulfilled' ? results[1].value : null,
        orders: results[2].status === 'fulfilled' ? results[2].value : null,
        hpp: results[3].status === 'fulfilled' ? results[3].value : null
      }

      cronLogger.info({}, 'Automation engine completed', summary)
      return summary

    } catch (err) {
      cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'Error running automation engine')
      throw err
    }
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(): Promise<{ notificationsDeleted: number }> {
    try {
      cronLogger.info({}, 'Starting notifications cleanup')

      const supabase = createServiceRoleClient()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('is_read', true)
        .select('id')

      if (error) {
        throw err
      }

      const deletedCount = data?.length || 0
      cronLogger.info({}, 'Notifications cleanup completed', { notificationsDeleted: deletedCount })

      return { notificationsDeleted: deletedCount }

    } catch (err) {
      cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'Error cleaning up notifications')
      throw err
    }
  }

  /**
   * Get automation status
   */
  static async getAutomationStatus(): Promise<AutomationStatus> {
    try {
      const supabase = createServiceRoleClient()

      // Get recent automation runs
      const { data: recentRuns } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Get system health metrics
      const metrics: AutomationStatus = {
        lastInventoryCheck: null,
        lastFinancialCheck: null,
        lastOrderCheck: null,
        lastHPPCheck: null,
        totalNotifications: 0,
        unreadNotifications: 0
      }

      if (recentRuns) {
        for (const run of recentRuns) {
          if (run.type === 'inventory' && !metrics.lastInventoryCheck) {
            metrics.lastInventoryCheck = run.created_at
          }
          if (run.type === 'financial' && !metrics.lastFinancialCheck) {
            metrics.lastFinancialCheck = run.created_at
          }
          if (run.type === 'orders' && !metrics.lastOrderCheck) {
            metrics.lastOrderCheck = run.created_at
          }
          if (run.type === 'hpp' && !metrics.lastHPPCheck) {
            metrics.lastHPPCheck = run.created_at
          }
        }
      }

      // Get notification counts
      const { data: notificationStats } = await supabase
        .from('notifications')
        .select('is_read')
        .eq('is_active', true)

      if (notificationStats) {
        metrics.totalNotifications = notificationStats.length
        metrics.unreadNotifications = notificationStats.filter(n => !n.is_read).length
      }

      return metrics

    } catch (err) {
      cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'Error getting automation status')
      throw err
    }
  }
}
