import type { Row } from '@/types/database'

/**
 * Notification System Module Types
 * Type definitions for notification system functionality
 */

// Use generated types for database entities

export interface SmartNotification {
  type: 'critical' | 'info' | 'success' | 'warning'
  category: 'financial' | 'inventory' | 'orders' | 'production'
  title: string
  message: string
  action?: string
  priority: 'high' | 'low' | 'medium'
  timestamp?: Date
  data?: Record<string, unknown>
}

export interface AutomationConfig {
  lowProfitabilityThreshold: number
  enableInventory?: boolean
  enableFinancial?: boolean
  enableProduction?: boolean
  enableOrders?: boolean
}

export interface FinancialMetrics {
  grossMargin: number
  netProfit: number
  netMargin: number
  inventoryValue: number
  revenue: number
}

export type Ingredient = Row<'ingredients'>

export interface OrderForNotification {
  delivery_date: string
  status: string
}

export interface UserPreferences {
  enableInventory?: boolean
  enableFinancial?: boolean
  enableProduction?: boolean
  enableOrders?: boolean
  minPriority?: 'high' | 'low' | 'medium'
}

export interface Equipment {
  name: string
  lastMaintenance: string
  intervalDays: number
}

export interface NotificationSummary {
  total: number
  critical: number
  warning: number
  info: number
  success: number
  byCategory: {
    inventory: number
    production: number
    financial: number
    orders: number
  }
  urgent: number
}
