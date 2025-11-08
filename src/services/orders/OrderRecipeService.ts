import type { RecipeOption, OrderPricing } from '@/modules/orders/types'

import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'

import { InventoryUpdateService } from './InventoryUpdateService'
import { OrderPricingService } from './OrderPricingService'
import { OrderValidationService } from './OrderValidationService'
import { ProductionTimeService } from './ProductionTimeService'
import { RecipeRecommendationService } from './RecipeRecommendationService'




/**
 * Main service class for order-recipe operations
 * Delegates to specialized services for different concerns
 */
export class OrderRecipeService {
  /**
   * Get available recipes for order selection
   */
  static getAvailableRecipes(): Promise<RecipeOption[]> {
    return RecipeAvailabilityService.getAvailableRecipes()
  }

  /**
   * Calculate pricing for order items
   */
  static calculateOrderPricing(
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
    return OrderPricingService.calculateOrderPricing(items, options)
  }

  /**
   * Validate order items against inventory
   */
  static validateOrderAgainstInventory(
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<{
    isValid: boolean
    warnings: string[]
    errors: string[]
  }> {
    return OrderValidationService.validateOrderAgainstInventory(items)
  }

  /**
   * Get recipe recommendations based on order history
   */
  static getRecipeRecommendations(
    customer_name?: string,
    limit = 5
  ): Promise<RecipeOption[]> {
    return RecipeRecommendationService.getRecipeRecommendations(customer_name, limit)
  }

  /**
   * Calculate production time estimate for order
   */
  static calculateProductionTime(
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<{
    total_prep_time: number
    total_cook_time: number
    estimated_completion: string
    parallel_processing_time: number
  }> {
    return ProductionTimeService.calculateProductionTime(items)
  }

  /**
   * Update ingredient inventory after order confirmation
   */
  static updateInventoryForOrder(
    order_id: string,
    user_id: string,
    items: Array<{
      recipe_id: string
      quantity: number
    }>
  ): Promise<void> {
    return InventoryUpdateService.updateInventoryForOrder(order_id, user_id, items)
  }
}
