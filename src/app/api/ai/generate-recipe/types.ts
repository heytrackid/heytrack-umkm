import type { Row } from '@/types/database'

export type Ingredient = Row<'ingredients'>
export type IngredientSubset = Pick<Ingredient, 'current_stock' | 'id' | 'name' | 'price_per_unit' | 'unit'>

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  notes?: string
}

export interface RecipeInstruction {
  step: number
  title: string
  description: string
  duration_minutes?: number
  temperature?: string
}

export interface GeneratedRecipe {
  name: string
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
  servings?: number
  prep_time_minutes?: number
  bake_time_minutes?: number
  total_time_minutes?: number
  difficulty?: string
  category?: string
  description?: string
  tips?: string[]
  storage?: string
  shelf_life?: string
}

export interface RawRecipeResponse {
  name?: unknown
  ingredients?: unknown
  instructions?: unknown
  servings?: unknown
  prep_time_minutes?: unknown
  bake_time_minutes?: unknown
  total_time_minutes?: unknown
  difficulty?: unknown
  category?: unknown
  description?: unknown
  tips?: unknown
  storage?: unknown
  shelf_life?: unknown
}

export interface OpenRouterMessage {
  role: string
  content: string
}

export interface OpenRouterChoice {
  message: OpenRouterMessage
  finish_reason: string
}

export interface OpenRouterResponse {
  choices: OpenRouterChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenRouterError {
  error?: {
    message?: string
  }
}

export interface HPPCalculation {
  totalMaterialCost: number
  operationalCost: number
  totalHPP: number
  hppPerUnit: number
  servings: number
  ingredientBreakdown: Array<{
    name: string
    quantity: number
    unit: string
    pricePerUnit: number
    totalCost: number
    percentage: number
  }>
  breakdown: Record<string, number>
  suggestedSellingPrice: number
  estimatedMargin: number
  note: string
}

export interface PromptParams {
  productName: string
  productType: string
  servings: number
  targetPrice?: number
  dietaryRestrictions?: string[]
  availableIngredients: IngredientSubset[]
  userProvidedIngredients?: string[]
  specialInstructions?: string
}
