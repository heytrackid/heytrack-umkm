import type {
    RecipeIngredientInsert as RecipeIngredientInsertType,
    RecipeIngredient as RecipeIngredientRow,
    RecipeIngredientUpdate as RecipeIngredientUpdateType,
    RecipeInsert as RecipeInsertType,
    Recipe as RecipeRow,
    RecipeUpdate as RecipeUpdateType
} from '@/types/database'

// Base types from generated schema
export type Recipe = RecipeRow
export type RecipeInsert = RecipeInsertType
export type RecipeUpdate = RecipeUpdateType

export type RecipeIngredient = RecipeIngredientRow
export type RecipeIngredientInsert = RecipeIngredientInsertType
export type RecipeIngredientUpdate = RecipeIngredientUpdateType

// Extended types for UI
export interface RecipeFormData extends Omit<Recipe, 'created_at' | 'id' | 'updated_at' | 'user_id'> {
  recipe_ingredients?: Array<Omit<RecipeIngredient, 'created_at' | 'id' | 'recipe_id'>>
}

export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: Array<RecipeIngredient & {
    ingredient: {
      id: string
      name: string
      unit: string
      price_per_unit: number
    }
  }>
}

// HPP Calculation types
export interface HPPCalculation {
  recipe_id: string
  total_ingredient_cost: number
  labor_cost: number
  overhead_cost: number
  total_cost: number
  cost_per_unit: number
  suggested_price: number
  margin_percentage: number
  created_at: string
}

export interface PricingRecommendation {
  standard: {
    price: number
    margin: number
  }
  premium: {
    price: number
    margin: number
  }
  economy: {
    price: number
    margin: number
  }
}

// Advanced HPP helper types
export const PRICING_METHOD = 'wac' as const
export type PricingMethod = typeof PRICING_METHOD

export interface RecipePricingAlternative {
  method: typeof PRICING_METHOD
  methodDescription: string
  costPerUnit: number
}

export interface RecipePricingSuggestion {
  price: number
  margin: number
  rationale: string
}

export interface RecipePricingSuggestions {
  economy: RecipePricingSuggestion
  standard: RecipePricingSuggestion
  premium: RecipePricingSuggestion
}

export interface RecipeHppIngredientBreakdown {
  ingredientName: string
  cost: number
  percentage: number
}

export interface RecipeHppBreakdown {
  ingredientCost: number
  operationalCost: number
  laborCost: number
  packagingCost: number
  totalCost: number
  costPerServing: number
  ingredientBreakdown: RecipeHppIngredientBreakdown[]
}

export type RecipeRiskLevel = 'HIGH' | 'LOW' | 'MEDIUM'

export interface RecipeMarginAnalysis {
  isProfitable: boolean
  riskLevel: RecipeRiskLevel
  currentMargin: number
  recommendedMargin: number
}

export interface RecipePricingAnalysis {
  currentPrice: number
  currentMargin: number
  breakEvenPrice: number
  competitorPriceRange: {
    min: number
    max: number
  }
}

export interface RecipeAvailability {
  canProduce: boolean
  productionCapacity: number
  limitingIngredients: string[]
  stockWarnings: string[]
}

export interface RecipeHppResult {
  servings: number
  breakdown: RecipeHppBreakdown
  pricingAnalysis: RecipePricingAnalysis
  marginAnalysis: RecipeMarginAnalysis
  suggestions: RecipePricingSuggestions
  availability: RecipeAvailability
  pricingAlternatives: RecipePricingAlternative[]
  recommendations: string[]
}

export interface HPPCalculationResult {
  servings: number
  calculations: {
    hppPerUnit: number
    suggestedSellingPrice: number
    profitMarginPercent: number
    totalHPP: number
  }
  pricingAlternatives: RecipePricingAlternative[]
  recommendations: string[]
}
