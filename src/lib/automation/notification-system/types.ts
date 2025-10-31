/**
 * Notification System Module Types
 * Type definitions for notification system functionality
 */

// Use generated types for database entities
import type { Database, IngredientsTable } from '@/types/database'

export interface SmartNotification {
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'inventory' | 'production' | 'financial' | 'orders'
  title: string
  message: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  timestamp?: Date
  data?: Record<string, any>
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

export type Ingredient = IngredientsTable

export interface OrderForNotification {
  delivery_date: string
  status: string
}

export interface UserPreferences {
  enableInventory?: boolean
  enableFinancial?: boolean
  enableProduction?: boolean
  enableOrders?: boolean
  minPriority?: 'low' | 'medium' | 'high'
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
