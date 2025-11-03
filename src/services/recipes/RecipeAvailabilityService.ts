import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Row, Json } from '@/types/database'
import { safeGet, typed, isRecord, hasKey, isArray } from '@/types/type-utilities'


type JsonValue = Json



/**
 * Recipe Availability Service
 * Enhanced availability checking considering reservations and lead time
 * SERVER-ONLY: Uses server client for database operations
 */


/* -------------------------------------------------------------------------- */
/*  DOMAIN TYPES                                                              */
/* -------------------------------------------------------------------------- */

type Ingredient = Row<'ingredients'>
type RecipeIngredient = Row<'recipe_ingredients'>

type RecipeIngredientWithIngredient = RecipeIngredient & {
  ingredient: Ingredient | null
}

type RecipeWithIngredients = Row<'recipes'> & {
  recipe_ingredients: RecipeIngredientWithIngredient[]
}


// Type guard
function isRecipeWithIngredients(value: JsonValue): value is RecipeWithIngredients {
  return isRecord(value) && hasKey(value, 'recipe_ingredients') && isArray(value.recipe_ingredients)
}

export interface RecipeAvailabilityResult {
  recipe_id: string
  recipe_name: string
  is_available: boolean
  max_quantity: number
  missing_ingredients: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortfall: number
    unit: string
    lead_time_days: number | null
  }>
  warnings: string[]
}

export class RecipeAvailabilityService {
  /**
   * Check recipe availability considering reserved stock
   */
  static async checkAvailability(
    recipeId: string,
    requestedQuantity = 1
  ): Promise<RecipeAvailabilityResult> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get recipe with ingredients
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          recipe_ingredients (
            quantity,
            unit,
            ingredient:ingredients (
              id,
              name,
              current_stock,
              unit,
              lead_time_days,
              reorder_point
            )
          )
        `)
        .eq('id', recipeId)
        .single()

      if (recipeError || !recipe) {
        throw new Error('Recipe not found')
      }

      // Validate recipe structure
      if (!isRecipeWithIngredients(recipe)) {
        throw new Error('Invalid recipe structure: missing recipe_ingredients')
      }

      const recipeIngredients = recipe.recipe_ingredients || []
      const missingIngredients: RecipeAvailabilityResult['missing_ingredients'] = []
      const warnings: string[] = []
      let maxQuantity = Infinity

      for (const ri of recipeIngredients) {
        const {ingredient} = ri
        if (!ingredient) {continue}

        const requiredPerUnit = ri.quantity
        const totalRequired = requiredPerUnit * requestedQuantity
        const currentStock = ingredient.current_stock ?? 0

        // Calculate max possible quantity based on this ingredient
        const maxFromThisIngredient = Math.floor(currentStock / requiredPerUnit)
        maxQuantity = Math.min(maxQuantity, maxFromThisIngredient)

        // Check if insufficient
        if (currentStock < totalRequired) {
          missingIngredients.push({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            required: totalRequired,
            available: currentStock,
            shortfall: totalRequired - currentStock,
            unit: ingredient.unit,
            lead_time_days: ingredient.lead_time_days
          })
        }

        // Check if approaching reorder point
        if (currentStock <= (ingredient.reorder_point ?? 0)) {
          warnings.push(
            `${ingredient.name} is at or below reorder point (${currentStock} ${ingredient.unit} available)`
          )
        }

        // Check if lead time might be an issue
        if (ingredient.lead_time_days && ingredient.lead_time_days > 3 && currentStock < totalRequired) {
          warnings.push(
            `${ingredient.name} has ${ingredient.lead_time_days} days lead time - order soon!`
          )
        }
      }

      const isAvailable = missingIngredients.length === 0

      return {
        recipe_id: recipeId,
        recipe_name: recipe.name,
        is_available: isAvailable,
        max_quantity: maxQuantity === Infinity ? 0 : maxQuantity,
        missing_ingredients: missingIngredients,
        warnings
      }

    } catch (err) {
      dbLogger.error({ error: err, recipeId }, 'Failed to check recipe availability')
      throw err
    }
  }

  /**
   * Check multiple recipes at once
   */
  static async checkMultipleRecipes(
    recipes: Array<{ recipe_id: string; quantity: number }>
  ): Promise<RecipeAvailabilityResult[]> {
    try {
      const results = await Promise.all(
        recipes.map(r => this.checkAvailability(r.recipe_id, r.quantity))
      )
      return results
    } catch (err) {
      dbLogger.error({ error: err }, 'Failed to check multiple recipes')
      throw err
    }
  }

  /**
   * Get all available recipes (can be made with current stock)
   */
  static async getAvailableRecipes(userId: string): Promise<Array<{
    recipe_id: string
    recipe_name: string
    max_quantity: number
    cost_per_unit: number
    selling_price: number | null
  }>> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get all active recipes
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          cost_per_unit,
          selling_price,
          recipe_ingredients (
            quantity,
            ingredient:ingredients (
              current_stock
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error || !recipes) {
        throw new Error('Failed to fetch recipes')
      }

      // Filter valid recipes
      const validRecipes = recipes.filter(isRecipeWithIngredients)
      const availableRecipes = []

      for (const recipe of validRecipes) {
        const recipeIngredients = recipe.recipe_ingredients || []
        let maxQuantity = Infinity

        for (const ri of recipeIngredients) {
          const {ingredient} = ri
          if (!ingredient) {continue}

          const currentStock = safeGet(ingredient, 'current_stock') ?? 0
          const maxFromThisIngredient = Math.floor(currentStock / ri.quantity)
          maxQuantity = Math.min(maxQuantity, maxFromThisIngredient)
        }

        if (maxQuantity > 0 && maxQuantity !== Infinity) {
          availableRecipes.push({
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            max_quantity: maxQuantity,
            cost_per_unit: recipe.cost_per_unit ?? 0,
            selling_price: recipe.selling_price
          })
        }
      }

      return availableRecipes.sort((a, b) => b.max_quantity - a.max_quantity)

    } catch (err) {
      dbLogger.error({ error: err }, 'Failed to get available recipes')
      return []
    }
  }

  /**
   * Suggest restock based on pending orders and lead time
   */
  static async getRestockSuggestions(userId: string): Promise<Array<{
    ingredient_id: string
    ingredient_name: string
    current_stock: number
    reserved_stock: number
    available_stock: number
    reorder_point: number
    suggested_order_quantity: number
    lead_time_days: number | null
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    reason: string
  }>> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get ingredients below reorder point or out of stock
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('id, name, current_stock, reorder_point, lead_time_days, unit')
        .eq('user_id', userId)
        .or('current_stock.lte.reorder_point,current_stock.eq.0')

      if (error || !ingredients) {
        return []
      }

      const suggestions = ingredients.map(ing => {
        const currentStock = ing.current_stock ?? 0
        const reorderPoint = ing.reorder_point ?? 0

        // In current schema, available_stock = current_stock (no reserved stock concept)
        const availableStock = currentStock
        const reservedStock = 0 // No reserved stock in current schema

        // Calculate suggested order quantity
        // Order enough to reach reorder point + buffer
        const buffer = reorderPoint * 0.5 // 50% buffer
        const targetStock = reorderPoint + buffer
        const suggestedQuantity = Math.max(0, targetStock - currentStock)

        // Determine urgency
        let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
        let reason = ''

        if (availableStock <= 0) {
          urgency = 'CRITICAL'
          reason = 'Out of stock - cannot fulfill new orders'
        } else if (availableStock < reorderPoint * 0.25) {
          urgency = 'HIGH'
          reason = 'Very low stock - order immediately'
        } else if (availableStock < reorderPoint * 0.5) {
          urgency = 'MEDIUM'
          reason = 'Below reorder point - order soon'
        } else {
          urgency = 'LOW'
          reason = 'Approaching reorder point'
        }

        // Adjust urgency based on lead time
        if (ing.lead_time_days && ing.lead_time_days > 7 && urgency !== 'CRITICAL') {
          if (urgency === 'LOW') {urgency = 'MEDIUM'}
          else if (urgency === 'MEDIUM') {urgency = 'HIGH'}
          reason += ` (${ing.lead_time_days} days lead time)`
        }

        return {
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          current_stock: currentStock,
          reserved_stock: reservedStock,
          available_stock: availableStock,
          reorder_point: reorderPoint,
          suggested_order_quantity: Math.ceil(suggestedQuantity),
          lead_time_days: ing.lead_time_days,
          urgency,
          reason
        }
      })

      // Sort by urgency
      const urgencyOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      return suggestions.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency])

    } catch (err) {
      dbLogger.error({ error: err }, 'Failed to get restock suggestions')
      return []
    }
  }
}
