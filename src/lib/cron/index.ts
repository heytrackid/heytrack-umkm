/**
 * Cron Jobs Module - Main Entry Point
 * Scheduled job management and automation services
 */

// Export all types
export * from './types'

// Export all cron job classes
export { CronScheduler } from './scheduler'
export { InventoryCronJobs } from './inventory'
export { FinancialCronJobs } from './financial'
export { OrderCronJobs } from './orders'
export { HPPCronJobs } from './hpp'
export { GeneralCronJobs } from './general'

// Re-export convenience functions for backward compatibility
import { CronScheduler } from './scheduler'
import { InventoryCronJobs } from './inventory'
import { FinancialCronJobs } from './financial'
import { OrderCronJobs } from './orders'
import { HPPCronJobs } from './hpp'
import { GeneralCronJobs } from './general'
import type { CronJobInfo } from './types'

/**
 * Run scheduled jobs (convenience function)
 */
export async function runScheduledJobs() {
  return CronScheduler.runScheduledJobs()
}

/**
 * Setup cron jobs (convenience function)
 */
export function setupCronJobs(): CronJobInfo[] {
  // Register default jobs
  CronScheduler.registerJob('inventory-reorder', 'daily', async () => { await InventoryCronJobs.checkInventoryReorder() })
  CronScheduler.registerJob('inventory-alerts', 'hourly', async () => { await InventoryCronJobs.checkInventoryAlerts() })
  CronScheduler.registerJob('financial-alerts', 'daily', async () => { await FinancialCronJobs.checkFinancialAlerts() })
  CronScheduler.registerJob('order-deadlines', 'hourly', async () => { await OrderCronJobs.checkOrderDeadlines() })
  CronScheduler.registerJob('cleanup-notifications', 'weekly', async () => { await GeneralCronJobs.cleanupOldNotifications() })

  return CronScheduler.getJobStatus()
}

/**
 * Get automation status (convenience function)
 */
export async function getAutomationStatus() {
  return GeneralCronJobs.getAutomationStatus()
}

// Legacy exports for backward compatibility
export { InventoryCronJobs as checkInventoryReorder }
export { InventoryCronJobs as checkInventoryAlerts }
export { OrderCronJobs as checkOrderDeadlines }
export { FinancialCronJobs as checkFinancialAlerts }
export { GeneralCronJobs as runAutomationEngine }
export { GeneralCronJobs as cleanupOldNotifications }
