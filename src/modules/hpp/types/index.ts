/**
 * HPP Module Types
 */

export interface HppCalculation {
  id: string
  recipe_id: string
  calculation_date: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
  wac_adjustment: number
  production_quantity: number
  notes?: string
  created_at: string
  updated_at?: string
}

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

export interface HppSnapshot {
  id: string
  recipe_id: string
  snapshot_date: string
  hpp_value: number
  material_cost: number
  labor_cost: number
  overhead_cost: number
  selling_price?: number
  margin_percentage?: number
  notes?: string
  created_at: string
}

export interface HppAlert {
  id: string
  recipe_id: string
  alert_type: 'PRICE_INCREASE' | 'MARGIN_LOW' | 'COST_SPIKE' | 'INGREDIENT_UNAVAILABLE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  current_value?: number
  previous_value?: number
  threshold_value?: number
  is_read: boolean
  recipe_name?: string
  created_at: string
  read_at?: string
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
