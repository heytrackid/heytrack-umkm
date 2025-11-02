import type { RecipeWithIngredients} from '@/types/query-results'
import type {RecipesTable, IngredientsTable } from '@/types/database'


/**
 * Supabase Query Helpers
 * 
 * Utilities for handling Supabase query results, especially joins.
 * Supabase returns arrays for joined relations, these helpers normalize the structure.
 */


type Recipe = RecipesTable
type Ingredient = IngredientsTable

/**
 * Extract first element from Supabase join result
 * Supabase returns arrays for joins, this helper extracts the first item
 */
export function extractFirst<T>(arr: T[] | null | undefined): T | null {
  return arr?.[0] ?? null
}

/**
 * Extract all elements from Supabase join result, filtering out nulls
 */
export function extractAll<T>(arr: T[] | null | undefined): T[] {
  return arr?.filter((item): item is T => item !== null && item !== undefined) ?? []
}

/**
 * Transform Supabase recipe query result with nested ingredients
 * 
 * Supabase structure:
 * {
 *   recipe_ingredients: [{
 *     ingredient: [{ id, name, ... }]  // Array!
 *   }]
 * }
 * 
 * Transformed structure:
 * {
 *   recipe_ingredients: [{
 *     ingredient: { id, name, ... }  // Object!
 *   }]
 * }
 */
export function transformRecipeWithIngredients(
  recipe: Recipe & {
    recipe_ingredients?: Array<{
      id: string
      recipe_id: string
      ingredient_id: string
      quantity: number
      unit: string
      user_id: string
      ingredient?: Ingredient[] | null
    }>
  }
): RecipeWithIngredients {
  return {
    ...recipe,
    recipe_ingredients: (recipe.recipe_ingredients ?? []).map(ri => ({
      id: ri.id,
      recipe_id: ri.recipe_id,
      ingredient_id: ri.ingredient_id,
      quantity: ri.quantity,
      unit: ri.unit,
      user_id: ri.user_id,
      ingredient: extractFirst(ri.ingredient) ?? {
        id: ri.ingredient_id,
        name: 'Unknown',
        unit: ri.unit,
        price_per_unit: 0,
        weighted_average_cost: 0,
        current_stock: 0,
        min_stock: 0,
        user_id: recipe.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: null,
        description: null,
        supplier: null,
        reorder_point: null,
        is_active: true,
        cost_per_unit: null,
        usage_rate_daily: null,
        reorder_lead_time: null,
        supplier_info: null,
        max_stock: null,
      }
    }))
  } as RecipeWithIngredients
}

/**
 * Calculate recipe COGS from ingredients with WAC
 */
export function calculateRecipeCOGS(recipe: RecipeWithIngredients): number {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return recipe.cost_per_unit ?? 0
  }

  let totalCost = 0
  
  for (const ri of recipe.recipe_ingredients) {
    if (ri.ingredient) {
      const wac = ri.ingredient.weighted_average_cost || 0
      const quantity = ri.quantity || 0
      totalCost += wac * quantity
    }
  }

  return totalCost
}

/**
 * Safe number conversion with fallback
 */
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {return value}
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

/**
 * Safe date conversion
 */
export function toDate(value: unknown): Date {
  if (value instanceof Date) {return value}
  if (typeof value === 'string') {return new Date(value)}
  return new Date()
}

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<K, T[]>)
}

/**
 * Sum array by numeric property
 */
export function sumBy<T>(
  array: T[],
  keyFn: (item: T) => number
): number {
  return array.reduce((sum, item) => sum + keyFn(item), 0)
}
