/**
 * HPP Module Types
 * Uses generated Supabase types as base
 */

import type { Database } from '@/types/supabase-generated'

// Use generated types from Supabase
export type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']
export type HppCalculationInsert = Database['public']['Tables']['hpp_calculations']['Insert']
export type HppCalculationUpdate = Database['public']['Tables']['hpp_calculations']['Update']

export interface HppCalculationResult {
  recipeId: string
  materialCost: number
  laborCost: number
  overheadCost: number
  totalHpp: number
  costPerUnit: number
  wacAdjustment: number
  productionQuantity: number
  materialBreakdown: MaterialBreakdown[]
}

export interface MaterialBreakdown {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
  unitPrice: number
  totalCost: number
}

// Use generated types from Supabase
export type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']
export type HppSnapshotInsert = Database['public']['Tables']['hpp_snapshots']['Insert']
export type HppSnapshotUpdate = Database['public']['Tables']['hpp_snapshots']['Update']

// Use generated types from Supabase
export type HppAlert = Database['public']['Tables']['hpp_alerts']['Row']
export type HppAlertInsert = Database['public']['Tables']['hpp_alerts']['Insert']
export type HppAlertUpdate = Database['public']['Tables']['hpp_alerts']['Update']

// Extended type with recipe name for UI
export interface HppAlertWithRecipe extends HppAlert {
  recipe_name?: string
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
  category: string
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
}

export type HppExportFormat = 'csv' | 'json' | 'pdf' | 'excel'

export type HppExportMetric =
  | 'hpp'
  | 'margin'
  | 'cost_breakdown'
  | 'trends'
  | 'alerts'
  | 'recommendations'

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
  data: string | Blob
  filename: string
  mimeType: string
}
