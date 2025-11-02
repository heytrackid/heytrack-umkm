import type {


// Recipe types - use generated Supabase types as base
  RecipesTable,
  RecipesInsert,
  RecipesUpdate,
  RecipeIngredientsTable,
  RecipeIngredientsInsert,
  RecipeIngredientsUpdate
} from '@/types/database'

// Base types from generated schema
export type Recipe = RecipesTable
export type RecipeInsert = RecipesInsert
export type RecipeUpdate = RecipesUpdate

export type RecipeIngredient = RecipeIngredientsTable
export type RecipeIngredientInsert = RecipeIngredientsInsert
export type RecipeIngredientUpdate = RecipeIngredientsUpdate

// Extended types for UI
export interface RecipeFormData extends Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'user_id'> {
  recipe_ingredients?: Array<Omit<RecipeIngredient, 'id' | 'recipe_id' | 'created_at'>>
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
export type PricingMethod = 'list_price' | 'weighted' | 'fifo' | 'moving' | 'latest'

export interface RecipePricingAlternative {
  method: PricingMethod
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

export type RecipeRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

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
