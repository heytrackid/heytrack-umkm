/**
 * Inventory Domain Module
 * Centralized exports untuk semua functionality terkait inventory
 */

// Components
export { default as InventoryPage } from './components/InventoryPage'
export { default as SmartInventoryManager } from './components/SmartInventoryManager'
export { default as InventoryTrendsChart } from './components/InventoryTrendsChart'
export { default as EnhancedInventoryPage } from './components/EnhancedInventoryPage'

// Extracted Smart Inventory Manager components
export { InventoryStatsCards } from './components/InventoryStatsCards'
export { InventoryAlerts } from './components/InventoryAlerts'
export { InventoryFilters } from './components/InventoryFilters'
export { InventoryGrid } from './components/InventoryGrid'
export { AlertsTab } from './components/AlertsTab'
export { ReorderTab } from './components/ReorderTab'
export { InsightsTab } from './components/InsightsTab'

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