/**
 * Root Barrel Export
 * Main entry point untuk semua modules dan utilities
 */

// Core Modules
export { 
  InventoryModule,
  OrdersModule, 
  RecipesModule,
  FinanceModule,
  ProductionModule,
  ReportsModule,
  SharedComponents,
  SharedHooks,
  SharedUtils,
  SharedApi,
  MODULES_CONFIG,
  getModuleConfig,
  getAllModules
} from './modules'

// Most Used Types (convenience re-exports)
export type { 
  Ingredient, 
  StockTransaction, 
  InventoryStats 
} from './modules/inventory/types'

export type { 
  Order, 
  OrderItem, 
  Customer 
} from './modules/orders/types'

export type { 
  Recipe, 
  RecipeIngredient, 
  HPPCalculation 
} from './modules/recipes/types'

export type { 
  Expense, 
  FinancialRecord, 
  BudgetItem 
} from './modules/finance/types'

// Quick Access to Common Components
export {
  AppLayout,
  DataTable,
  StatsCard,
  LoadingSpinner,
  ErrorMessage
} from './shared/components'

// Quick Access to Common Hooks  
export {
  useSupabaseCRUD,
  useResponsive,
  useToast,
  useDebounce
} from './shared/hooks'

// Quick Access to Common Utils
export {
  formatCurrency,
  formatDate,
  debounce,
  groupBy
} from './shared/utils'