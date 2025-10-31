/**
 * Business Services Convenience Functions
 * Easy-to-use wrapper functions for common business operations
 */

import { InventoryServices } from './inventory'
import { ProductionServices } from './production'
import type { ProductionBatch, ReorderSummary } from './types'

/**
 * Check inventory reorder needs (convenience function)
 */
export async function checkInventoryReorder(): Promise<ReorderSummary> {
  const service = InventoryServices.getInstance()
  return service.checkReorderNeeds()
}

/**
 * Schedule production batch (convenience function)
 */
export async function scheduleProductionBatch(batch: Omit<ProductionBatch, 'id' | 'status'>): Promise<ProductionBatch> {
  const service = ProductionServices.getInstance()
  return service.scheduleProductionBatch(batch)
}

// Export singleton instances for convenience
export const inventoryServices = InventoryServices.getInstance()
export const productionServices = ProductionServices.getInstance()

/**
 * Check if production is feasible for a recipe
 */
export async function checkProductionFeasibility(recipeId: string, quantity: number) {
  return productionServices.checkProductionFeasibility(recipeId, quantity)
}

/**
 * Get stock alerts for all ingredients
 */
export async function getStockAlerts() {
  return inventoryServices.getStockAlerts()
}

/**
 * Get production capacity for a recipe
 */
export async function getProductionCapacity(recipeId: string) {
  return productionServices.getProductionCapacity(recipeId)
}

/**
 * Quick production batch scheduling with validation
 */
export async function quickScheduleProduction(recipeId: string, quantity: number, scheduledDate?: string) {
  return productionServices.scheduleProductionBatch({
    recipe_id: recipeId,
    quantity,
    scheduled_date: scheduledDate
  })
}
