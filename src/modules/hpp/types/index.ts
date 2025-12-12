/**
 * HPP Module Types
 * Uses generated Supabase types as base
 */

import type {
    HppCalculationInsert as HppCalculationInsertType,
    HppCalculation as HppCalculationRow,
    HppCalculationUpdate as HppCalculationUpdateType
} from '@/types/database'

// Use generated types from Supabase
export type HppCalculation = HppCalculationRow
export type HppCalculationInsert = HppCalculationInsertType
export type HppCalculationUpdate = HppCalculationUpdateType

export interface HppCalculationResult {
  recipe_id: string // Use snake_case for consistency with DB
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
  wac_adjustment: number
  production_quantity: number
  material_breakdown: MaterialBreakdown[]
}

export interface MaterialBreakdown {
  ingredient_id: string
  ingredient_name: string
  quantity: number
  unit: string
  unit_price: number
  total_cost: number
}





export interface HppOverview {
  totalRecipes: number
  calculatedRecipes: number
  totalHppValue: number
  averageMargin: number
  alerts: Array<{
    recipe_id: string
    recipe_name: string
    issue: string
    severity: 'low' | 'medium' | 'high'
  }>
}

export interface HppComparisonItem {
  id: string
  name: string
  cost_per_unit: number
  selling_price: number
  margin_percentage: number
  last_calculated: string | null
}

export type HppComparison = HppComparisonItem[]

export interface RecipeWithHpp {
  id: string
  name: string
  category: string | null
  selling_price: number | null
  margin_percentage: number | null
  ingredients: RecipeIngredientWithPrice[]
  operational_costs: number
  labor_costs: number
  overhead_costs: number
  total_cost: number
}

export interface RecipeIngredientWithPrice {
  id: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  waste_factor?: number
  category?: string
}

export type HppExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

export type HppExportMetric =
  'alerts' | 'cost_breakdown' | 'hpp' | 'margin' | 'recommendations' | 'trends'

export interface HppExportOptions {
  format: HppExportFormat
  recipeIds?: string[]
  dateRange?: {
    start: string
    end: string
  }
  metrics?: HppExportMetric[]
}

export interface HppExportResult {
  data: Blob | string
  filename: string
  mimeType: string
}
