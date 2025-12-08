
// AI Recipe Generator Types
// Type definitions for AI-powered recipe generation

export interface GeneratedRecipe {
  name: string
  description: string
  category: string
  servings: number
  prep_time_minutes: number
  cook_time_minutes?: number
  bake_time_minutes?: number // Alias for cook_time_minutes
  total_time_minutes: number
  difficulty: 'easy' | 'hard' | 'medium' | string
  cooking_method?: string
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
  tips: string[]
  storage: string
  shelf_life: string
  serving_suggestion?: string
  hpp?: HPPData
}

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

export interface HPPData {
  totalMaterialCost: number
  estimatedOperationalCost: number
  totalHPP: number
  hppPerUnit: number
  suggestedSellingPrice: number
  estimatedMargin: number
}

export interface GenerationParams {
  productName: string
  productType: string
  servings: number
  targetPrice?: number
  dietaryRestrictions: string[]
  availableIngredients: string[]
  userId: string
}

export interface AvailableIngredient {
  id: string
  name: string
  current_stock: number | null
  unit: string
  price_per_unit: number
  minimum_stock?: number
}

export const PRODUCT_TYPES = [
  { value: 'bread', label: 'Roti' },
  { value: 'cake', label: 'Kue' },
  { value: 'pastry', label: 'Pastry' },
  { value: 'cookies', label: 'Cookies' },
  { value: 'donuts', label: 'Donat' },
  { value: 'other', label: 'Lainnya' }
]

export const DIETARY_RESTRICTIONS = [
  'Halal',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free'
]

export type VariationType = 'spicier' | 'sweeter' | 'healthier' | 'budget' | 'premium'
