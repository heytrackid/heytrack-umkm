export interface IngredientCostSnapshot {
  id: string
  name: string
  price_per_unit: number | null
  weighted_average_cost: number | null
  unit?: string | null
  updated_at?: string | null
}

export interface RecipeIngredientSnapshot {
  ingredient_id: string
  quantity: number | null
  ingredients: IngredientCostSnapshot | null
}

export interface RecipeCostRecord {
  id: string
  name: string
  servings: number | null
  updated_at: string | null
  recipe_ingredients: RecipeIngredientSnapshot[] | null
}

export interface RecipeCostPreview {
  recipeId: string
  materialCost: number
  costPerServing: number
  lastUpdated: string | null
  ingredientsCount: number
}

export interface RecipeCostImpactChange {
  ingredientId: string
  ingredientName: string
  latestPrice: number
  previousPrice: number
  changeAmount: number
  changePercent: number | null
  quantity: number
  impactAmount: number
  lastUpdated: string | null
}

export interface RecipeCostImpact {
  totalCost: number
  costPerServing: number
  lastPriceUpdate: string | null
  priceChangeImpact: number
  changes: RecipeCostImpactChange[]
}

export interface CostChangeAlert {
  ingredientId: string
  ingredientName: string
  previousPrice: number
  currentPrice: number
  changePercent: number
  changeAmount: number
  lastPurchaseDate: string | null
  affectedRecipes: Array<{
    recipeId: string
    recipeName: string
    impactAmount: number
  }>
}

export const isRecipeCostRecord = (value: unknown): value is RecipeCostRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<RecipeCostRecord>
  return Boolean(record?.id && Array.isArray(record.recipe_ingredients))
}
