/**
 * Cron Jobs Setup for Automation
 * 
 * This file sets up scheduled tasks for:
 * - Auto reorder inventory
 * - Smart notifications
 * - Financial sync
 * - Production automation
 */

import { autoReorderService } from '@/services/inventory/AutoReorderService'
import { smartNotificationSystem } from '@/lib/smart-notifications'
import { enhancedAutomationEngine } from '@/lib/enhanced-automation-engine'

/**
 * Check inventory reorder needs
 * Runs every day at 6:00 AM
 */
export async function checkInventoryReorder() {
  try {
    console.log('🔄 [CRON] Running inventory reorder check...')
    
    const summary = await autoReorderService.checkReorderNeeds()
    
    console.log(`✅ [CRON] Reorder check complete:`, {
      total_alerts: summary.total_alerts,
      critical_items: summary.critical_items,
      auto_orders_generated: summary.auto_orders_generated
    })
    
    // Add notifications for critical items
    if (summary.critical_items > 0) {
      smartNotificationSystem.addNotification({
        type: 'error',
        category: 'inventory',
        priority: 'critical',
        title: `${summary.critical_items} Bahan Kritis!`,
        message: `Ada ${summary.critical_items} bahan yang perlu segera direstock.`,
        actionUrl: '/inventory',
        actionLabel: 'Cek Stock'
      })
    }
    
    return summary
  } catch (error: any) {
    console.error('❌ [CRON] Error in inventory reorder check:', error)
    throw error
  }
}

/**
 * Process smart notifications
 * Runs every hour
 */
export async function processSmartNotifications() {
  try {
    console.log('🔔 [CRON] Processing smart notifications...')
    
    // Check inventory alerts
    const inventoryAlerts = await checkInventoryAlerts()
    
    // Check order deadlines
    const orderAlerts = await checkOrderDeadlines()
    
    // Check financial alerts
    const financialAlerts = await checkFinancialAlerts()
    
    console.log(`✅ [CRON] Notifications processed:`, {
      inventory: inventoryAlerts,
      orders: orderAlerts,
      financial: financialAlerts
    })
    
    return {
      inventory: inventoryAlerts,
      orders: orderAlerts,
      financial: financialAlerts
    }
  } catch (error: any) {
    console.error('❌ [CRON] Error processing notifications:', error)
    throw error
  }
}

/**
 * Check inventory alerts
 */
async function checkInventoryAlerts() {
  try {
    const { data: ingredients } = await import('@/lib/supabase').then(m => 
      m.supabase.from('ingredients').select('*')
    )
    
    if (!ingredients) return 0
    
    let alertCount = 0
    
    ingredients.forEach((ingredient: any) => {
      const currentStock = ingredient.current_stock ?? 0
      const minStock = ingredient.min_stock ?? 0
      
      if (currentStock <= 0) {
        smartNotificationSystem.addNotification({
          type: 'error',
          category: 'inventory',
          priority: 'critical',
          title: 'Stock Habis!',
          message: `${ingredient.name} sudah habis. Segera restock!`,
          actionUrl: '/inventory',
          actionLabel: 'Restock'
        })
        alertCount++
      } else if (currentStock < minStock) {
        smartNotificationSystem.addNotification({
          type: 'warning',
          category: 'inventory',
          priority: 'high',
          title: 'Stock Rendah',
          message: `${ingredient.name} tinggal ${currentStock} ${ingredient.unit}`,
          actionUrl: '/inventory',
          actionLabel: 'Cek Stock'
        })
        alertCount++
      }
    })
    
    return alertCount
  } catch (error: any) {
    console.error('Error checking inventory alerts:', error)
    return 0
  }
}

/**
 * Check order deadlines
 */
async function checkOrderDeadlines() {
  try {
    const { data: orders } = await import('@/lib/supabase').then(m => 
      m.supabase
        .from('orders')
        .select('*')
        .in('status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
        .not('delivery_date', 'is', null)
    )
    
    if (!orders) return 0
    
    let alertCount = 0
    const now = new Date()
    
    orders.forEach((order: any) => {
      const deliveryDate = new Date(order.delivery_date)
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      // Alert if delivery is in less than 24 hours and order is not ready
      if (hoursUntilDelivery < 24 && hoursUntilDelivery > 0 && order.status !== 'READY') {
        smartNotificationSystem.addNotification({
          type: 'warning',
          category: 'orders',
          priority: 'high',
          title: 'Order Deadline Dekat!',
          message: `Order #${order.order_no} untuk ${order.customer_name} harus siap dalam ${Math.round(hoursUntilDelivery)} jam`,
          actionUrl: `/orders/${order.id}`,
          actionLabel: 'Lihat Order'
        })
        alertCount++
      }
      
      // Alert if overdue
      if (hoursUntilDelivery < 0) {
        smartNotificationSystem.addNotification({
          type: 'error',
          category: 'orders',
          priority: 'critical',
          title: 'Order Terlambat!',
          message: `Order #${order.order_no} untuk ${order.customer_name} sudah melewati waktu delivery`,
          actionUrl: `/orders/${order.id}`,
          actionLabel: 'Handle Order'
        })
        alertCount++
      }
    })
    
    return alertCount
  } catch (error: any) {
    console.error('Error checking order deadlines:', error)
    return 0
  }
}

/**
 * Check financial alerts
 */
async function checkFinancialAlerts() {
  try {
    // Get expenses this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data: expenses } = await import('@/lib/supabase').then(m => 
      m.supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startOfMonth.toISOString())
    )
    
    if (!expenses) return 0
    
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
    
    // Alert if expenses are high (example: > 10 million)
    const expenseThreshold = 10000000
    
    if (totalExpenses > expenseThreshold) {
      smartNotificationSystem.addNotification({
        type: 'warning',
        category: 'financial',
        priority: 'medium',
        title: 'Biaya Tinggi Bulan Ini',
        message: `Total biaya bulan ini sudah Rp ${(totalExpenses / 1000000).toFixed(1)}jt`,
        actionUrl: '/operational-costs',
        actionLabel: 'Review Biaya'
      })
      return 1
    }
    
    return 0
  } catch (error: any) {
    console.error('Error checking financial alerts:', error)
    return 0
  }
}

/**
 * Run automation engine
 * Runs every 30 minutes
 */
export async function runAutomationEngine() {
  try {
    console.log('⚙️ [CRON] Running automation engine...')
    
    // Process automated workflows
    await enhancedAutomationEngine.processWorkflows()
    
    console.log('✅ [CRON] Automation engine completed')
  } catch (error: any) {
    console.error('❌ [CRON] Error running automation engine:', error)
    throw error
  }
}

/**
 * Cleanup old notifications
 * Runs daily at midnight
 */
export async function cleanupOldNotifications() {
  try {
    console.log('🧹 [CRON] Cleaning up old notifications...')
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { error } = await import('@/lib/supabase').then(m => 
      m.supabase
        .from('notifications')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString())
        .eq('is_read', true)
    )
    
    if (error) throw error
    
    console.log('✅ [CRON] Old notifications cleaned up')
  } catch (error: any) {
    console.error('❌ [CRON] Error cleaning notifications:', error)
    throw error
  }
}

/**
 * Get automation status
 */
export async function getAutomationStatus() {
  try {
    const notifications = smartNotificationSystem.getNotifications()
    const summary = smartNotificationSystem.getSummary()
    
    return {
      notifications: {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        summary
      },
      lastRun: {
        reorderCheck: new Date().toISOString(),
        notifications: new Date().toISOString(),
        automationEngine: new Date().toISOString()
      },
      status: 'active'
    }
  } catch (error: any) {
    console.error('Error getting automation status:', error)
    return {
      status: 'error',
      error: error.message
    }
  }
}

// Export all cron functions
export const cronJobs = {
  checkInventoryReorder,
  processSmartNotifications,
  runAutomationEngine,
  cleanupOldNotifications,
  getAutomationStatus
}
