/**
 * Cron Jobs Setup for Automation
 * 
 * This file sets up scheduled tasks for:
 * - Auto reorder inventory
 * - Smart notifications
 * - Financial sync
 * - Production automation
 * - HPP snapshot creation
 * - HPP alert detection
 * - HPP data archival
 */

import { enhancedAutomationEngine } from '@/lib/enhanced-automation-engine'
import { smartNotificationSystem } from '@/lib/smart-notifications'
import { autoReorderService } from '@/services/inventory/AutoReorderService'
import { cronLogger } from './logger'

/**
 * Check inventory reorder needs
 * Runs every day at 6:00 AM
 */
export async function checkInventoryReorder() {
  try {
    cronLogger.info('Running inventory reorder check')

    const summary = await autoReorderService.checkReorderNeeds()

    cronLogger.info('Reorder check complete', {
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
    cronLogger.error('Error in inventory reorder check', { error: error.message })
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

/**
 * Create daily HPP snapshots for all users
 * Runs every day at 00:00
 */
export async function createDailyHPPSnapshots() {
  try {
    cronLogger.info('Running daily HPP snapshot creation')

    const supabase = createServerSupabaseAdmin()

    // Get all active users with recipes
    const { data: users, error: usersError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('is_active', true)

    if (usersError) {
      cronLogger.error('Error fetching users for HPP snapshots', { error: usersError.message })
      throw usersError
    }

    if (!users || users.length === 0) {
      cronLogger.info('No active users with recipes found')
      return {
        total_users: 0,
        snapshots_created: 0,
        alerts_generated: 0,
        errors: []
      }
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(users.map(u => u.user_id))]

    let totalSnapshotsCreated = 0
    let totalAlertsGenerated = 0
    const errors: Array<{ user_id: string; error: string }> = []

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Call the snapshot API endpoint logic
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/hpp/snapshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Snapshot creation failed')
        }

        const result = await response.json()
        totalSnapshotsCreated += result.data.snapshots_created || 0
        totalAlertsGenerated += result.data.alerts_generated || 0

        cronLogger.info(`HPP snapshots created for user ${userId}`, {
          snapshots: result.data.snapshots_created,
          alerts: result.data.alerts_generated
        })

      } catch (error: any) {
        cronLogger.error(`Error creating HPP snapshots for user ${userId}`, { error: error.message })
        errors.push({
          user_id: userId,
          error: error.message
        })
      }

      // Add small delay between users to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    const summary = {
      total_users: uniqueUserIds.length,
      snapshots_created: totalSnapshotsCreated,
      alerts_generated: totalAlertsGenerated,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }

    cronLogger.info('Daily HPP snapshot creation complete', summary)

    return summary

  } catch (error: any) {
    cronLogger.error('Error in daily HPP snapshot creation', { error: error.message })
    throw error
  }
}

/**
 * Detect HPP alerts for all users
 * Runs every 6 hours
 */
export async function detectHPPAlertsForAllUsers() {
  try {
    cronLogger.info('Running HPP alert detection')

    const supabase = createServerSupabaseAdmin()

    // Get all active users with recipes
    const { data: users, error: usersError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('is_active', true)

    if (usersError) {
      cronLogger.error('Error fetching users for alert detection', { error: usersError.message })
      throw usersError
    }

    if (!users || users.length === 0) {
      cronLogger.info('No active users with recipes found')
      return {
        total_users: 0,
        alerts_generated: 0,
        snapshots_analyzed: 0,
        errors: []
      }
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(users.map(u => u.user_id))]

    let totalAlertsGenerated = 0
    let totalSnapshotsAnalyzed = 0
    const errors: Array<{ user_id: string; error: string }> = []
    const startTime = Date.now()

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Detect alerts for this user
        const alertResult = await detectHPPAlerts(userId)

        // Save alerts to database
        if (alertResult.alerts.length > 0) {
          await saveAlerts(alertResult.alerts)
          totalAlertsGenerated += alertResult.alerts.length
        }

        totalSnapshotsAnalyzed += alertResult.snapshots_analyzed

        cronLogger.info(`HPP alerts detected for user ${userId}`, {
          alerts: alertResult.alerts.length,
          snapshots_analyzed: alertResult.snapshots_analyzed
        })

      } catch (error: any) {
        cronLogger.error(`Error detecting HPP alerts for user ${userId}`, { error: error.message })
        errors.push({
          user_id: userId,
          error: error.message
        })
      }

      // Add small delay between users
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const executionTime = Date.now() - startTime
    const successRate = ((uniqueUserIds.length - errors.length) / uniqueUserIds.length) * 100

    const summary = {
      total_users: uniqueUserIds.length,
      alerts_generated: totalAlertsGenerated,
      snapshots_analyzed: totalSnapshotsAnalyzed,
      execution_time_ms: executionTime,
      success_rate: successRate.toFixed(2) + '%',
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }

    cronLogger.info('HPP alert detection complete', summary)

    return summary

  } catch (error: any) {
    cronLogger.error('Error in HPP alert detection', { error: error.message })
    throw error
  }
}

/**
 * Archive HPP snapshots older than 1 year
 * Runs monthly on the 1st at 02:00
 */
export async function archiveOldHPPSnapshots() {
  try {
    cronLogger.info('Running HPP data archival')

    const supabase = createServerSupabaseAdmin()

    // Calculate date 1 year ago
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Get snapshots older than 1 year
    const { data: oldSnapshots, error: fetchError } = await supabase
      .from('hpp_snapshots')
      .select('*')
      .lt('snapshot_date', oneYearAgo.toISOString())

    if (fetchError) {
      cronLogger.error('Error fetching old snapshots', { error: fetchError.message })
      throw fetchError
    }

    if (!oldSnapshots || oldSnapshots.length === 0) {
      cronLogger.info('No snapshots to archive')
      return {
        snapshots_archived: 0,
        oldest_date: null,
        timestamp: new Date().toISOString()
      }
    }

    cronLogger.info(`Found ${oldSnapshots.length} snapshots to archive`)

    // Insert into archive table in batches
    const batchSize = 100
    let totalArchived = 0
    const errors: Array<{ batch: number; error: string }> = []

    for (let i = 0; i < oldSnapshots.length; i += batchSize) {
      const batch = oldSnapshots.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1

      try {
        // Insert into archive table
        const { error: insertError } = await supabase
          .from('hpp_snapshots_archive')
          .insert(batch)

        if (insertError) {
          throw insertError
        }

        // Delete from main table
        const snapshotIds = batch.map(s => s.id)
        const { error: deleteError } = await supabase
          .from('hpp_snapshots')
          .delete()
          .in('id', snapshotIds)

        if (deleteError) {
          throw deleteError
        }

        totalArchived += batch.length

        cronLogger.info(`Archived batch ${batchNumber}`, {
          batch_size: batch.length,
          total_archived: totalArchived
        })

      } catch (error: any) {
        cronLogger.error(`Error archiving batch ${batchNumber}`, { error: error.message })
        errors.push({
          batch: batchNumber,
          error: error.message
        })
      }

      // Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Verify data integrity
    const { count: remainingOldSnapshots } = await supabase
      .from('hpp_snapshots')
      .select('*', { count: 'exact', head: true })
      .lt('snapshot_date', oneYearAgo.toISOString())

    const { count: archivedCount } = await supabase
      .from('hpp_snapshots_archive')
      .select('*', { count: 'exact', head: true })

    const summary = {
      snapshots_archived: totalArchived,
      oldest_date: oldSnapshots[0]?.snapshot_date,
      remaining_old_snapshots: remainingOldSnapshots || 0,
      total_in_archive: archivedCount || 0,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }

    cronLogger.info('HPP data archival complete', summary)

    return summary

  } catch (error: any) {
    cronLogger.error('Error in HPP data archival', { error: error.message })
    throw error
  }
}

// Export all cron functions
export const cronJobs = {
  checkInventoryReorder,
  processSmartNotifications,
  runAutomationEngine,
  cleanupOldNotifications,
  getAutomationStatus,
  createDailyHPPSnapshots,
  detectHPPAlertsForAllUsers,
  archiveOldHPPSnapshots
}
