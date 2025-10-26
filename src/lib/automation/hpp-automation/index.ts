/**
 * HPP Automation Module - Main Entry Point
 * Automated HPP calculation and monitoring system
 */

// Export all types
export * from './types'

// Export all modules
export { HPPCalculator } from './calculator'
export { IngredientMonitor } from './ingredient-monitor'
export { CostManager } from './cost-manager'
export { RecipeService } from './recipe-service'
export { CacheManager } from './cache-manager'
export { HPPNotificationService } from './notification-service'
export { HPPMonitor } from './monitor'
export { HPPAutomationSystem } from './system'

// Re-export convenience functions and singleton instance for backward compatibility
import { HPPAutomationSystem } from './system'
import { calculateHPP, detectHPPAlerts, takeSnapshot, getSnapshots } from '../../hpp'

// Export singleton instance
export const hppAutomation = HPPAutomationSystem.getInstance()

// Export helper functions for integration
export const calculateAutoHPP = async (recipeId: string) => {
  return hppAutomation.calculateSmartHPP(recipeId)
}

export const triggerIngredientPriceUpdate = async (ingredientId: string, oldPrice: number, newPrice: number) => {
  return hppAutomation.onIngredientPriceChange(ingredientId, oldPrice, newPrice)
}

export const updateOperationalCosts = (costId: string, newAmount: number) => {
  return hppAutomation.updateOperationalCost(costId, newAmount)
}

// Legacy HPP functions (redirected to modular system)
export const calculateHPPCompat = calculateHPP
export const detectHPPAlertsCompat = detectHPPAlerts
export const takeSnapshotCompat = takeSnapshot
export const getSnapshotsCompat = getSnapshots

export default hppAutomation
