import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types'

// Database types
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']

// Configuration for automation rules
export interface AutomationConfig {
  // General settings
  enabled: boolean
  maxConcurrentJobs: number
  retryAttempts: number
  notificationEnabled: boolean

  // Pricing automation
  defaultProfitMargin: number // e.g., 60% 
  minimumProfitMargin: number // e.g., 30%
  maximumProfitMargin: number // e.g., 200%
  
  // Inventory automation  
  autoReorderDays: number // e.g., 7 days before stock runs out
  safetyStockMultiplier: number // e.g., 1.5x normal usage
  
  // Production automation
  productionLeadTime: number // hours needed for production
  batchOptimizationThreshold: number // minimum batch size
  
  // Financial automation
  lowProfitabilityThreshold: number // e.g., 20%
  cashFlowWarningDays: number // e.g., 7 days
}

// Pricing types
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

// Inventory types
export type InventoryStatus = 'critical' | 'low' | 'adequate' | 'overstocked'
export type ReorderUrgency = 'urgent' | 'soon' | 'normal'

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

// Production types
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
  startTime: Date
  estimatedDuration: number
  batchCount: number
}

export interface ProductionPlanItem {
  orderId: string
  recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }
  quantity: number
  deliveryDate: Date
  production: ProductionTimeInfo & { canProduce: boolean }
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

// Financial types
export interface SaleData {
  amount: number
  cost: number
  date: string
}

export interface ExpenseData {
  amount: number
  category: string
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
  type: 'warning' | 'critical' | 'info'
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

// Notification types
export type NotificationType = 'critical' | 'warning' | 'info' | 'success'
export type NotificationCategory = 'inventory' | 'production' | 'financial' | 'orders'
export type NotificationPriority = 'high' | 'medium' | 'low'

export interface SmartNotification {
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  action: string
  priority: NotificationPriority
  timestamp?: Date
  data?: any
}

// Event types untuk automation triggers
export type WorkflowEvent =
  | 'order.status_changed'
  | 'order.completed'
  | 'order.cancelled'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'production.batch_completed'
  | 'ingredient.price_changed'
  | 'operational_cost.changed'
  | 'hpp.recalculation_needed'

export interface WorkflowEventData {
  event: WorkflowEvent
  entityId: string
  data: unknown
  timestamp: string
}

export interface WorkflowResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export interface WorkflowContext {
  event: WorkflowEventData
  supabase: SupabaseClient<Database> | null
  logger: any // Logger instance
  config: AutomationConfig
}