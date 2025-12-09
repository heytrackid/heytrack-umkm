/**
 * AI Services Module
 * Centralized exports for all AI-related services
 */

// Re-export all services for easy imports
export { AiService } from './AiService'
export { BudgetTrackingService } from './BudgetTrackingService'
export { FinanceWiseService } from './FinanceWiseService'
export { ProactiveAlertService } from './ProactiveAlertService'

// Export types
export type {
    AiSuggestions, ChatRequest,
    ChatResponse, GeneratedRecipe, RecipeGenerationRequest,
    RecipeGenerationResponse
} from './AiService'

export type {
    CashFlowForecast, FinanceWiseResponse,
    FinancialAlert, FinancialHealth, FinancialSummary, ProfitAnalysis
} from './FinanceWiseService'

export type {
    AlertHistory, AlertTrigger
} from './ProactiveAlertService'

export type {
    Budget, BudgetCreateRequest, BudgetStatus, BudgetTransaction
} from './BudgetTrackingService'

