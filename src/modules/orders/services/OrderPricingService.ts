import { supabase } from '@/lib/supabase'
import { HPPCalculationService } from '@/modules/recipes'
import { ORDER_CONFIG } from '../constants'
import type { OrderItemCalculation, OrderPricing } from './OrderRecipeService'

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
          price,
          servings,
          recipe_ingredients (
            quantity,
            unit,
            ingredient:ingredients (
              unit_cost,
              unit_type
            )
          )
        `)
        .in('id', recipeIds)

      if (error) throw error
      if (!recipes) throw new Error('Recipes not found')

      // Calculate each item
      const calculatedItems: OrderItemCalculation[] = await Promise.all(
        items.map(async (item) => {
          const recipe = recipes.find(r => r.id === item.recipe_id)
          if (!recipe) {
            throw new Error(`Recipe with ID ${item.recipe_id} not found`)
          }

          // Calculate HPP cost
          const hppCalculation = await HPPCalculationService.calculateAdvancedHPP(
            recipe.id,
            {
              overheadRate: 0.15,
              laborCostPerHour: 25000,
              targetMargin: 0.6
            }
          )

          const unit_price = item.custom_price || recipe.price || hppCalculation.suggestedPricing.standard.price
          const total_price = unit_price * item.quantity
          const hpp_cost = hppCalculation.costPerServing
          const total_cost = hpp_cost * item.quantity
          const profit = total_price - total_cost
          const margin_percentage = total_price > 0 ? (profit / total_price) * 100 : 0

          return {
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            quantity: item.quantity,
            unit_price,
            total_price,
            hpp_cost,
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

      const total_hpp_cost = calculatedItems.reduce((sum, item) => sum + item.total_cost, 0)
      const total_profit = final_subtotal - total_hpp_cost
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
        total_hpp_cost,
        total_profit,
        overall_margin
      }
    } catch (error: any) {
      logger.error({ err: error }, 'Error calculating order pricing')
      throw new Error('Failed to calculate order pricing')
    }
  }
}
