import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import { ORDER_CONFIG } from '@/lib/constants'
import type { OrderItemCalculation, OrderPricing } from './OrderRecipeService'
import type { Recipe, RecipeIngredient } from '@/types/domain/recipes'
import type { Ingredient } from '@/types/domain/inventory'

/**
 * Recipe with ingredients for pricing calculation
 */
interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}

/**
 * Service for handling order pricing calculations
 */
export class OrderPricingService {
  /**
   * Calculate pricing for order items
   */
  static async calculateOrderPricing(
    items: Array<{
      recipe_id: string
      quantity: number
      custom_price?: number
    }>,
    options: {
      tax_rate?: number
      discount_amount?: number
      discount_percentage?: number
    } = {}
  ): Promise<OrderPricing> {
    try {
      const {
        tax_rate = ORDER_CONFIG.DEFAULT_TAX_RATE,
        discount_amount = 0,
        discount_percentage = 0
      } = options

      // Get recipe details for pricing
      const recipeIds = items.map(item => item.recipe_id)
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          selling_price,
          servings,
          recipe_ingredients (
            quantity,
            unit,
            ingredient:ingredients (
              price_per_unit,
              unit
            )
          )
        `)
        .in('id', recipeIds)

      if (error) {throw error}
      if (!recipes) {throw new Error('Recipes not found')}

      // Type assertion for Supabase query result
      interface RecipeQueryResult {
        id: string
        name: string
        selling_price: number | null
        servings: number | null
        recipe_ingredients: Array<{
          quantity: number
          unit: string
          ingredient: Array<{
            price_per_unit: number
            unit: string
          }>
        }>
      }

      // Calculate each item
      const calculatedItems: OrderItemCalculation[] = await Promise.all(
        items.map(async (item) => {
          const recipe = (recipes as RecipeQueryResult[]).find(r => r.id === item.recipe_id)
          if (!recipe) {
            throw new Error(`Recipe with ID ${item.recipe_id} not found`)
          }

          // Use recipe selling price as unit price (no HPP calculation)
          const unit_price = item.custom_price || recipe.selling_price || 0
          const total_price = unit_price * item.quantity
          
          // For now, assume cost is 70% of selling price (rough estimate without detailed costing)
          const estimated_cost_percentage = 0.7
          const estimated_cost = unit_price * estimated_cost_percentage
          const total_cost = estimated_cost * item.quantity
          const profit = total_price - total_cost
          const margin_percentage = total_price > 0 ? (profit / total_price) * 100 : 0

          return {
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            quantity: item.quantity,
            unit_price,
            total_price,
            estimated_cost,
            total_cost,
            profit,
            margin_percentage
          }
        })
      )

      // Calculate totals
      const subtotal = calculatedItems.reduce((sum, item) => sum + item.total_price, 0)

      // Apply discount
      let final_subtotal = subtotal
      if (discount_percentage > 0) {
        final_subtotal = subtotal * (1 - discount_percentage / 100)
      } else if (discount_amount > 0) {
        final_subtotal = Math.max(0, subtotal - discount_amount)
      }

      const tax_amount = final_subtotal * tax_rate
      const total_amount = final_subtotal + tax_amount

      const total_estimated_cost = calculatedItems.reduce((sum, item) => sum + item.total_cost, 0)
      const total_profit = final_subtotal - total_estimated_cost
      const overall_margin = final_subtotal > 0 ? (total_profit / final_subtotal) * 100 : 0

      return {
        items: calculatedItems,
        subtotal,
        tax_amount,
        tax_rate,
        discount_amount: discount_percentage > 0
          ? subtotal * (discount_percentage / 100)
          : discount_amount,
        total_amount,
        total_estimated_cost,
        total_profit,
        overall_margin
      }
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Error calculating order pricing')
      throw new Error('Failed to calculate order pricing')
    }
  }
}
