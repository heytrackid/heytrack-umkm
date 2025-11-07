import { InventoryServices } from './inventory'
import { ProductionServices } from './production'

import type { ProductionBatch, ReorderSummary } from './types'


/**
 * Business Services Convenience Functions
 * Easy-to-use wrapper functions for common business operations
 */


/**
 * Check inventory reorder needs (convenience function)
 */
export function checkInventoryReorder(): Promise<ReorderSummary> {
  const service = InventoryServices.getInstance()
  return service.checkReorderNeeds()
}

/**
 * Schedule production batch (convenience function)
 */
export function scheduleProductionBatch(batch: Omit<ProductionBatch, 'id' | 'status'>): Promise<ProductionBatch> {
  const service = ProductionServices.getInstance()
  return service.scheduleProductionBatch(batch)
}

// Export singleton instances for convenience
export const inventoryServices = InventoryServices.getInstance()
export const productionServices = ProductionServices.getInstance()

/**
 * Check if production is feasible for a recipe
 */
export function checkProductionFeasibility(recipeId: string, quantity: number) {
  return productionServices.checkProductionFeasibility(recipeId, quantity)
}

/**
 * Get stock alerts for all ingredients
 */
export function getStockAlerts() {
  return inventoryServices.getStockAlerts()
}

/**
 * Get production capacity for a recipe
 */
export function getProductionCapacity(recipeId: string) {
  return productionServices.getProductionCapacity(recipeId)
}

/**
 * Quick production batch scheduling with validation
 */
export function quickScheduleProduction(recipeId: string, quantity: number, scheduledDate?: string) {
  const batchData: Omit<ProductionBatch, 'id' | 'status'> = {
    recipe_id: recipeId,
    quantity,
    scheduled_date: scheduledDate ?? new Date().toISOString()
  }
  return productionServices.scheduleProductionBatch(batchData)
}
