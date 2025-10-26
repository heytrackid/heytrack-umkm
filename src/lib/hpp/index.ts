/**
 * HPP Module - Main Entry Point
 * Backward compatible exports for all HPP functionality
 */

// Export all types
export * from './types'

// Export all classes
export { HPPCalculator } from './calculator'
export { HPPAlertDetector } from './alerts'
export { HPPSnapshotManager } from './snapshots'
export { HPPUtils } from './utils'
export { HPPNotificationService } from './communications'

// Re-export convenience functions for backward compatibility
import { HPPCalculator } from './calculator'
import { HPPAlertDetector } from './alerts'
import { HPPSnapshotManager } from './snapshots'
import type {
  HPPCalculationOptions,
  HPPCalculationResult,
  AlertDetectionResult,
  HPPComparison
} from './types'

/**
 * Calculate HPP for a recipe (convenience function)
 */
export async function calculateHPP(
  recipeId: string,
  userId: string,
  options?: Partial<HPPCalculationOptions>
): Promise<HPPCalculationResult> {
  return HPPCalculator.calculateHPP(recipeId, userId, options)
}

/**
 * Detect HPP alerts for a user (convenience function)
 */
export async function detectHPPAlerts(userId: string): Promise<AlertDetectionResult> {
  return HPPAlertDetector.detectHPPAlerts(userId)
}

/**
 * Take HPP snapshot for a recipe (convenience function)
 */
export async function takeSnapshot(recipeId: string, userId: string): Promise<any> {
  return HPPSnapshotManager.createSnapshot(recipeId, userId)
}

/**
 * Get HPP snapshots for a recipe (convenience function)
 */
export async function getSnapshots(recipeId: string, userId: string, limit?: number): Promise<any[]> {
  return HPPSnapshotManager.getSnapshots(recipeId, userId, limit)
}

/**
 * Compare HPP snapshots (convenience function)
 */
export function compareSnapshots(current: any, previous: any): HPPComparison {
  return HPPSnapshotManager.compareSnapshots(current, previous)
}
