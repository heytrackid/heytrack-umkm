/**
 * Finance Domain Module
 * Centralized exports untuk semua functionality terkait keuangan & expenses
 */

// Components
export { default as SmartExpenseAutomation } from './components/SmartExpenseAutomation'
// Note: Other components will be added as they are migrated

// Lazy loaded components
export { 
  LazySmartExpenseAutomation,
  LazySmartFinancialDashboard,
  LazyFinancialTrendsChart,
  preloadFinanceComponents,
  FinanceDashboardWithProgressiveLoading,
  useFinanceProgressiveLoading
} from './components/LazyComponents'

// Hooks (when added)
// export { useExpensesData } from './hooks/useExpensesData'
// export { useFinancialData } from './hooks/useFinancialData'

// Services (when added)
// export { ExpensesService } from './services/ExpensesService'
// export { FinancialAnalyticsService } from './services/FinancialAnalyticsService'

// Types (when added)
// export type {
//   Expense,
//   FinancialRecord,
//   BudgetItem
// } from './types'

// Utils (when added)
// export { 
//   calculateProfitMargin,
//   formatFinancialAmount
// } from './utils'

// Constants (when added)
// export { EXPENSE_CATEGORIES } from './constants'
