/**
 * HPP (Harga Pokok Produksi) Type Definitions
 * Centralized types for all HPP-related functionality
 */

export interface HPPCalculationOptions {
  overheadRate: number
  laborCostPerHour: number
  targetMargin: number
}

export interface HPPCalculationResult {
  total_hpp: number
  material_cost: number
  operational_cost: number
  breakdown: {
    ingredientCost: number
    laborCost: number
    overheadCost: number
    packagingCost: number
  }
  suggestedPricing: {
    economy: { price: number; margin: number }
    standard: { price: number; margin: number }
    premium: { price: number; margin: number }
  }
  profitability: {
    isViable: boolean
    breakEvenQuantity: number
    recommendedMargin: number
  }
}

export interface AlertDetectionResult {
  alerts: HPPAlert[]
  snapshots_analyzed: number
}

export interface HPPAlert {
  id: string
  recipe_id: string
  recipe_name: string
  change_percentage: number
  change_amount: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  is_read: boolean
  type?: string
}

export interface HPPSnapshot {
  id?: string
  recipe_id: string
  recipe_name: string
  user_id: string
  total_hpp: number
  material_cost: number
  operational_cost: number
  breakdown: HPPCalculationResult['breakdown']
  created_at: string
}

export interface HPPComparison {
  recipe_id: string
  recipe_name: string
  current_hpp: number
  previous_hpp: number
  change_percentage: number
  change_amount: number
  trend: 'up' | 'down' | 'stable'
  period: string
}

export interface TimePeriod {
  start: string
  end: string
  label: string
}

export interface AffectedComponents {
  ingredient_cost: number
  operational_cost: number
  packaging_cost: number
}

export interface ComponentChange {
  component: keyof AffectedComponents
  old_value: number
  new_value: number
  change_amount: number
  change_percentage: number
}

export interface CostBreakdown {
  ingredients: IngredientCost[]
  operational: OperationalCost[]
  packaging: number
}

export interface IngredientCost {
  ingredient_id: string
  ingredient_name: string
  quantity: number
  unit_cost: number
  total_cost: number
  unit: string
}

export interface OperationalCost {
  id: string
  name: string
  amount: number
  type: 'fixed' | 'variable'
  frequency: 'daily' | 'weekly' | 'monthly'
}

export interface SeverityColors {
  color: string
  bgColor: string
  borderColor: string
  icon: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
}
