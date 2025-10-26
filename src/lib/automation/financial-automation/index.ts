/**
 * Financial Automation Module - Main Entry Point
 * Comprehensive financial analysis and automation system
 */

// Export all types
export * from '../types' // Main automation types
export * from './types' // Local financial types

// Export all modules
export { MetricsCalculator } from './metrics-calculator'
export { TrendAnalyzer } from './trend-analyzer'
export { AlertGenerator } from './alert-generator'
export { RecommendationEngine } from './recommendation-engine'
export { BreakEvenAnalyzer } from './break-even-analyzer'
export { ProjectionEngine } from './projection-engine'
export { PricingOptimizer } from './pricing-optimizer'
export { FinancialAutomation } from './system'

// Re-export for backward compatibility
// export { FinancialAutomation as default }
