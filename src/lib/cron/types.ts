/**
 * Cron Jobs Module Types
 * Centralized type definitions for all cron job functionality
 */

export interface CronJobInfo {
  name: string
  schedule: string
  lastRun?: string
  status: 'active' | 'pending'
}

export interface AutomationStatus {
  lastInventoryCheck: string | null
  lastFinancialCheck: string | null
  lastOrderCheck: string | null
  lastHPPCheck: string | null
  totalNotifications: number
  unreadNotifications: number
}

export interface AutomationEngineResult {
  inventory: {
    alerts: unknown[]
    reorderSuggestions: unknown[]
  }
  financial: {
    metrics: Record<string, number>
    alerts: unknown[]
  }
  orders: {
    pending: unknown[]
    overdue: unknown[]
  }
  hpp: {
    calculations: unknown[]
    alerts: unknown[]
  }
}

export interface InventoryReorderSummary {
  total_alerts: number
  critical_items: number
  auto_orders_generated: number
}

export interface CronJobResult {
  [key: string]: unknown
}

export interface JobSchedule {
  name: string
  schedule: string
  handler: () => Promise<void>
  lastRun?: Date
}

export interface NotificationAlert {
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'inventory' | 'orders' | 'financial' | 'production' | 'customer' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
}
