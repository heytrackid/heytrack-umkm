// Notification system types

export type NotificationType = 
  'cost_increase' | 'daily_summary' | 'error' | 'info' | 'ingredient_expiring' | 'order_overdue' | 'order_pending' | 'profit_margin_low' | 'stock_critical' | 'stock_low' | 'stock_out' | 'success' | 'system' | 'warning'

export type NotificationPriority = 'critical' | 'high' | 'low' | 'medium'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown>
  icon?: string
  color?: string
}

export interface NotificationPreferences {
  enabled: boolean
  types: Record<NotificationType, boolean>
  minPriority: NotificationPriority
  soundEnabled: boolean
  desktopNotifications: boolean
  emailNotifications: boolean
  checkInterval: number // minutes
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {
    stock_low: true,
    stock_out: true,
    stock_critical: true,
    order_pending: true,
    order_overdue: true,
    ingredient_expiring: true,
    cost_increase: true,
    profit_margin_low: true,
    daily_summary: false,
    system: true,
    success: true,
    warning: true,
    error: true,
    info: true
  },
  minPriority: 'low',
  soundEnabled: true,
  desktopNotifications: false,
  emailNotifications: false,
  checkInterval: 15 // Check every 15 minutes
}

// Notification type configs
export const NOTIFICATION_CONFIGS: Record<NotificationType, {
  icon: string
  color: string
  defaultPriority: NotificationPriority
}> = {
  stock_low: {
    icon: '⚠️',
    color: 'yellow',
    defaultPriority: 'medium'
  },
  stock_out: {
    icon: '🚫',
    color: 'red',
    defaultPriority: 'high'
  },
  stock_critical: {
    icon: '🔴',
    color: 'red',
    defaultPriority: 'critical'
  },
  order_pending: {
    icon: '📦',
    color: 'blue',
    defaultPriority: 'medium'
  },
  order_overdue: {
    icon: '⏰',
    color: 'red',
    defaultPriority: 'high'
  },
  ingredient_expiring: {
    icon: '📅',
    color: 'orange',
    defaultPriority: 'medium'
  },
  cost_increase: {
    icon: '💰',
    color: 'yellow',
    defaultPriority: 'low'
  },
  profit_margin_low: {
    icon: '📉',
    color: 'orange',
    defaultPriority: 'medium'
  },
  daily_summary: {
    icon: '📊',
    color: 'blue',
    defaultPriority: 'low'
  },
  system: {
    icon: '⚙️',
    color: 'gray',
    defaultPriority: 'low'
  },
  success: {
    icon: '✅',
    color: 'green',
    defaultPriority: 'low'
  },
  warning: {
    icon: '⚠️',
    color: 'yellow',
    defaultPriority: 'medium'
  },
  error: {
    icon: '❌',
    color: 'red',
    defaultPriority: 'high'
  },
  info: {
    icon: 'ℹ️',
    color: 'blue',
    defaultPriority: 'low'
  }
}
