// Enhanced Automation Engine Types
import type { Database } from '@/types'

export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type Order = Database['public']['Tables']['orders']['Row']

export interface EnhancedAutomationConfig {
  // HPP & Pricing Intelligence
  targetProfitMargin: number      // 60% - Indonesian F&B standard
  competitivePricingBuffer: number // 10% - market competition buffer
  premiumPricingMultiplier: number // 2.5x - for premium products

  // Advanced Inventory Intelligence
  predictiveDays: number          // 30 - days to predict usage
  seasonalityFactor: number       // 1.2 - seasonal demand multiplier
  supplierReliabilityScore: number // 0.8 - supplier reliability factor
  emergencyStockDays: number      // 3 - days of emergency stock

  // Production Intelligence
  maxProductionCapacityHours: number // 12 - maximum daily production hours
  setupTimeMinutes: number        // 15 - setup time between recipes
  qualityControlTimePercent: number // 10% - time for quality control

  // Business Intelligence
  profitabilityTrendDays: number  // 90 - days to analyze trends
  customerSatisfactionWeight: number // 0.3 - weight for customer ratings
  seasonalPlanningMonths: number  // 6 - months ahead planning

  // Alert Intelligence
  alertPriorityWeights: {         // Weights for alert prioritization
    financial: number
    inventory: number
    production: number
    quality: number
  }
}

export interface HPPCalculationResult {
  recipe_id: string
  total_ingredient_cost: number
  cost_per_serving: number
  suggested_selling_price: number
  margin_at_current_price: number
  can_produce: boolean
  max_possible_batches: number
}

export interface InventoryAnalysisResult {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reorder_point: number
  days_until_stockout: number
  suggested_order_quantity: number
  urgency_level: string
  cost_impact: number
}

export interface ProductionOptimizationResult {
  recipe_id: string
  recipe_name: string
  suggested_quantity: number
  estimated_duration: number
  priority_score: number
  profit_potential: number
  ingredient_availability: boolean
}
