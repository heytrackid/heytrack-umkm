import type { AutomationConfig } from '@/lib/automation/types'

/**
 * Automation Engine - Main Entry Point
 * Modular automation system untuk UMKM F&B
 */

// Re-export all automation modules (selective to avoid conflicts)
export { FinancialAutomation } from './financial-automation'
export { HppAutomation } from './hpp-automation'
export { InventoryAutomation } from './inventory-automation'
export { NotificationSystem } from './notification-system'
export { PricingAutomation } from './pricing-automation'
export { ProductionAutomation } from './production-automation'
export type * from './types'

// Re-export workflow system
export * from './workflows'

// Import for default engine

// Default configuration for Indonesian UMKM F&B
export const UMKM_CONFIG: AutomationConfig = {
  // General settings
  enabled: true,
  maxConcurrentJobs: 5,
  retryAttempts: 3,
  notificationEnabled: true,

  // Pricing automation
  defaultProfitMargin: 60, // 60% margin - typical for F&B
  minimumProfitMargin: 30, // 30% minimum
  maximumProfitMargin: 150, // 150% for premium products

  // Inventory automation
  autoReorderDays: 7, // Reorder 7 days before stock out
  safetyStockMultiplier: 1.5, // 50% safety stock

  // Production automation
  productionLeadTime: 4, // 4 hours production buffer
  batchOptimizationThreshold: 5, // Minimum 5 units per batch

  // Financial automation
  lowProfitabilityThreshold: 20, // Alert if margin below 20%
  cashFlowWarningDays: 7 // Cash flow warning 7 days ahead
}

// Main Automation Engine Class
export class AutomationEngine {
  private config: AutomationConfig

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = { ...UMKM_CONFIG, ...config }
  }

  getConfig() {
    return this.config
  }

  updateConfig(updates: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...updates }
  }
}

// Export default instance
export const defaultAutomationEngine = new AutomationEngine(UMKM_CONFIG)

// Note: Main exports already done above
