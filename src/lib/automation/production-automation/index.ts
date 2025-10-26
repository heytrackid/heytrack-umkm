/**
 * Production Automation Module - Main Entry Point
 * Comprehensive production planning and automation system
 */

// Export all types
export * from '../types' // Main automation types
export * from './types' // Local production types

// Export all modules
export { ProductionPlanner } from './production-planner'
export { AvailabilityChecker } from './availability-checker'
export { TimeCalculator } from './time-calculator'
export { CapacityManager } from './capacity-manager'
export { ProductionRecommendations } from './recommendations'
export { ProductionAutomation } from './system'

// Re-export for backward compatibility
// export { ProductionAutomation as default }
