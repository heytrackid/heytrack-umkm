/**
 * Profit Components Module
 * Re-exports all profit-related components for easy importing
 */

// Components
export { ProfitSummaryCards } from './ProfitSummaryCards'
export { ProfitFilters } from './ProfitFilters'
export { ProductProfitabilityChart } from './ProductProfitabilityChart'
export { ProductProfitabilityTable } from './ProductProfitabilityTable'
export { IngredientCostsTable } from './IngredientCostsTable'
export { OperatingExpenses } from './OperatingExpenses'
export { ProfitBreakdown } from './ProfitBreakdown'
export { ProfitInfoCard } from './ProfitInfoCard'

// Hooks
export { useProfitData } from '@/app/profit/hooks/useProfitData'

// Types
export type * from './types'

// Utils
export { useProductChartData, formatCurrencyAmount } from '@/app/profit/utils/chartData'
