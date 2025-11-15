
/**
 * Profit Components Module
 * Re-exports all profit-related components for easy importing
 */

// Components
export { IngredientCostsTable } from './IngredientCostsTable'
export { OperatingExpenses } from './OperatingExpenses'
export { ProductProfitabilityTable } from './ProductProfitabilityTable'
export { ProfitBreakdown } from './ProfitBreakdown'
export { ProfitFiltersComponent as ProfitFilters } from './ProfitFilters'
export { ProfitInfoCard } from './ProfitInfoCard'
export { ProfitSummaryCards } from './ProfitSummaryCards'

// Hooks
export { useProfitData } from '@/app/profit/hooks/useProfitData'

// Types
export type * from './types'
