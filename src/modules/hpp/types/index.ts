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
  recipesWithHpp: number
  averageHpp: number
  unreadAlerts: number
  totalAlerts: number
  lastCalculated?: string
}

export interface HppComparison {
  id: string
  name: string
  category: string
  hppValue: number
  sellingPrice: number
  marginPercentage: number
  marginAmount: number
  lastCalculated: string
}

export interface RecipeWithHpp {
  id: string
  name: string
  category: string | null
  selling_price: number | null
  margin_percentage: number | null
  ingredients: RecipeIngredientWithPrice[]
  operational_costs: number
  total_cost: number
}

export interface RecipeIngredientWithPrice {
  id: string
  name: string
  quantity: number
  unit: string
  unit_price: number
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
