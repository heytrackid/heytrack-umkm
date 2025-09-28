/**
 * Inventory Domain Module
 * Centralized exports untuk semua functionality terkait inventory
 */

// Components
export { default as InventoryPage } from './components/InventoryPage'
export { default as SmartInventoryManager } from './components/SmartInventoryManager'
export { default as InventoryTrendsChart } from './components/InventoryTrendsChart'
// Note: Other components will be added as they are migrated

// Lazy loaded components
export { 
  LazySmartInventoryManager,
  LazyInventoryTrendsChart,
  LazyInventoryPage,
  preloadInventoryComponents,
  InventoryPageWithProgressiveLoading,
  useInventoryProgressiveLoading
} from './components/LazyComponents'

// Hooks
export { useInventoryData } from './hooks/useInventoryData'
export { useStockTransactions } from './hooks/useStockTransactions'
export { useInventoryAnalytics } from './hooks/useInventoryAnalytics'

// Services
export { InventoryService } from './services/InventoryService'
export { StockCalculationService } from './services/StockCalculationService'

// Types
export type {
  Ingredient,
  StockTransaction,
  InventoryStats,
  StockAlert,
  ReorderPoint
} from './types'

// Utils
export { 
  calculateReorderPoint,
  calculateStockValue,
  formatStockUnit,
  getStockAlerts
} from './utils'

// Constants
export { STOCK_TRANSACTION_TYPES, INVENTORY_CATEGORIES } from './constants'