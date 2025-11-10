
// Main hook
export { useAIPowered } from './useAIPowered'

// Individual analysis hooks
export { usePricingAnalysis } from './usePricingAnalysis'
export { useInventoryOptimization } from './useInventoryOptimization'
export { useCustomerAnalytics } from './useCustomerAnalytics'
export { useFinancialAnalysis } from './useFinancialAnalysis'
export { useSmartInsights } from './useSmartInsights'

// Types
export type {
  AIAnalysisState,
  PricingAnalysisRequest,
  InventoryOptimizationRequest,
  CustomerAnalyticsRequest,
  FinancialAnalysisRequest,
  SmartInsightsRequest,
  AIInsight,
  AnalysisType
} from './types'
