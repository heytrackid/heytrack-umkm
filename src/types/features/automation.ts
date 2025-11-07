import type { Recipe, Ingredient, RecipeIngredient } from '@/types'
import type { Database } from '@/types/database'

import type { SupabaseClient } from '@supabase/supabase-js'

export type { Recipe, Ingredient, RecipeIngredient }

export interface AutomationConfig {
  enabled: boolean
  maxConcurrentJobs: number
  retryAttempts: number
  notificationEnabled: boolean
  defaultProfitMargin: number
  minimumProfitMargin: number
  maximumProfitMargin: number
  autoReorderDays: number
  safetyStockMultiplier: number
  productionLeadTime: number
  batchOptimizationThreshold: number
  lowProfitabilityThreshold: number
  cashFlowWarningDays: number
  enableInventory?: boolean
  enableFinancial?: boolean
  enableProduction?: boolean
  enableOrders?: boolean
  [key: string]: unknown
}

export interface PricingOption {
  price: number
  margin: number
  positioning: string
}

export interface CompetitivePricing {
  economy: PricingOption
  standard: PricingOption
  premium: PricingOption
}

export interface PricingBreakdown {
  ingredientCost: number
  overheadCost: number
  totalCost: number
  costPerServing: number
}

export interface ProfitabilityAnalysis {
  tier: string
  profitAmount: number
  profitMargin: number
  breakEvenVolume: number
}

export interface SmartPricingResult {
  breakdown: PricingBreakdown
  pricing: CompetitivePricing
  analysis: ProfitabilityAnalysis[]
  recommendations: string[]
}

export type InventoryStatus = 'adequate' | 'critical' | 'low' | 'overstocked'
export type ReorderUrgency = 'normal' | 'soon' | 'urgent'

export interface ReorderRecommendation {
  shouldReorder: boolean
  quantity: number
  urgency: ReorderUrgency
  estimatedCost: number
}

export interface InventoryAnalysis {
  ingredient: Ingredient
  status: InventoryStatus
  daysRemaining: number
  reorderRecommendation: ReorderRecommendation
  insights: string[]
}

export interface IngredientRequirement {
  ingredient: Ingredient
  needed: number
  available: number
  sufficient: boolean
  shortage: number
}

export interface AvailabilityCheck {
  canProduce: boolean
  requirements: IngredientRequirement[]
  totalShortage: number
}

export interface ProductionTimeInfo {
  preparationTime: number
  productionTime: number
  cleanupTime: number
  totalTime: number
}

export interface ProductionPlanItem {
  orderId: string
  recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }
  quantity: number
  deliveryDate: Date
  production: {
    canProduce: boolean
    startTime: Date
    estimatedDuration: number
    batchCount: number
  }
  ingredients: AvailabilityCheck
  recommendations: string[]
}

export interface ProductionPlanSummary {
  totalOrders: number
  canProduceCount: number
  totalBatches: number
  estimatedHours: number
}

export interface ProductionPlan {
  plan: ProductionPlanItem[]
  summary: ProductionPlanSummary
  optimizations: string[]
}

export interface SaleData {
  id?: string
  amount: number
  cost: number
  date: string
}

export interface ExpenseData {
  id?: string
  category: string
  amount: number
  date: string
}

export interface FinancialMetrics {
  revenue: number
  grossProfit: number
  netProfit: number
  grossMargin: number
  netMargin: number
  inventoryValue: number
}

export interface FinancialTrend {
  period: string
  revenue: number
  profit: number
  margin: number
}

export interface FinancialAlert {
  type: 'critical' | 'info' | 'warning'
  message: string
  metric: string
  value: number
  threshold: number
}

export interface FinancialAnalysis {
  metrics: FinancialMetrics
  trends: FinancialTrend[]
  alerts: FinancialAlert[]
  recommendations: string[]
}

export type NotificationType = 'alert' | 'error' | 'info' | 'success' | 'warning'
export type NotificationCategory = 'financial' | 'inventory' | 'orders' | 'production' | 'system'
export type NotificationPriority = 'high' | 'low' | 'medium' | 'urgent'

export interface SmartNotification {
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  data?: Record<string, unknown>
  status?: 'failed' | 'pending' | 'sent'
}

export type WorkflowEvent = string

export interface WorkflowEventData {
  event: WorkflowEvent
  entityId: string
  data: Record<string, unknown>
  timestamp: string
}

export interface WorkflowResult {
  success: boolean
  message?: string
  error?: string
  data?: unknown
}

export interface WorkflowContext {
  event: WorkflowEventData
  supabase: SupabaseClient<Database> | null
  logger: Record<'debug' | 'error' | 'info' | 'warn', (...args: unknown[]) => unknown>
  config: AutomationConfig
}
