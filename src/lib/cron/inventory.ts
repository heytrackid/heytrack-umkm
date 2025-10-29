/**
 * Inventory Cron Jobs Module
 * Scheduled jobs for inventory management and alerts
 * SERVER-ONLY: Uses service role client for automated tasks
 */

import 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { cronLogger } from '@/lib/logger'
// import { inventoryServices } from '@/lib/business-services/utils'
// import type { ReorderSummary } from '@/lib/business-services/types'
import { SmartNotificationSystem } from '@/lib/communications/notifications'
import type { InventoryReorderSummary, NotificationAlert } from './types'
import type { Database } from '@/types/supabase-generated'

type Ingredient = Database['public']['Tables']['ingredients']['Row']
type InventoryAlert = Database['public']['Tables']['inventory_alerts']['Row']

export class InventoryCronJobs {
  /**
   * Check inventory reorder needs
   * Runs every day at 6:00 AM
   */
  static async checkInventoryReorder(): Promise<InventoryReorderSummary> {
    try {
      cronLogger.info({}, 'Running inventory reorder check')

      const supabase = createServiceRoleClient()
      
      // Get ingredients that need reordering
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .lte('current_stock', supabase.raw('minimum_stock'))
      
      if (error) {
        throw error
      }
      
      const totalItems = ingredients?.length || 0
      const criticalItems = ingredients?.filter(i => i.current_stock <= (i.minimum_stock * 0.5)).length || 0
      
      const summary: InventoryReorderSummary = {
        total_alerts: totalItems,
        critical_items: criticalItems,
        auto_orders_generated: 0
      }

      cronLogger.info({}, 'Reorder check complete', {
        total_alerts: summary.total_alerts,
        critical_items: summary.critical_items,
        auto_orders_generated: summary.auto_orders_generated
      })

      // Add notifications for critical items
      if (summary.critical_items > 0) {
        SmartNotificationSystem.getInstance().addNotification({
          category: 'inventory',
          priority: 'critical',
          title: `${summary.critical_items} Bahan Kritis!`,
          message: `Ada ${summary.critical_items} bahan yang perlu segera direstock.`,
          actionUrl: '/inventory',
          actionLabel: 'Cek Stock',
          status: 'sent'
        })
      }

      return summary
    } catch (err) {
      cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'Error checking inventory reorder')
      throw err
    }
  }

  /**
   * Check inventory alerts (low stock, out of stock)
   */
  static async checkInventoryAlerts(): Promise<{ alertsGenerated: number }> {
    try {
      cronLogger.info({}, 'Running inventory alerts check')

      const supabase = createServiceRoleClient()
      const alerts: NotificationAlert[] = []

      // Check low stock items
      const { data: ingredientData, error } = await supabase
        .from('ingredients')
        .select('id, name, current_stock, reorder_point')
        .eq('is_active', true)

      if (error) {
        throw err
      }

      const lowStockItems = (ingredientData ?? []).filter(item => {
        const currentStock = item.current_stock ?? 0
        const reorderPoint = item.reorder_point ?? 0
        if (reorderPoint <= 0) {
          return false
        }
        return currentStock < reorderPoint * 1.5
      })

      if (lowStockItems.length > 0) {
        alerts.push({
          type: 'warning',
          category: 'inventory',
          priority: 'medium',
          title: `${lowStockItems.length} Bahan Stok Rendah`,
          message: `${lowStockItems.length} bahan perlu direstock dalam waktu dekat.`,
          actionUrl: '/inventory',
          actionLabel: 'Kelola Stock',
          status: 'sent'
        })
      }

      // Send notifications
      for (const alert of alerts) {
        SmartNotificationSystem.getInstance().addNotification(alert)
      }

      return { alertsGenerated: alerts.length }
    } catch (err) {
      cronLogger.error({ err: err instanceof Error ? err.message : String(err) }, 'Error checking inventory alerts')
      throw err
    }
  }
}
