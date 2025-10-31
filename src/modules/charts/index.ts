/**
 * Charts Domain Module
 * Centralized exports untuk semua chart components dan utilities
 */

// Core chart components
export { default as FinancialTrendsChart } from './components/FinancialTrendsChart'
export { default as InventoryTrendsChart } from './components/InventoryTrendsChart'
export { default as MiniChart } from './components/MiniChart'

// Lazy loaded chart components
export { 
  LazyFinancialTrendsChart,
  LazyInventoryTrendsChart,
  LazyMiniChart,
  LazyRechartsLineChart,
  LazyRechartsBarChart,
  LazyRechartsAreaChart,
  LazyRechartsPieChart,
  preloadChartComponents,
  preloadRechartsBundle,
  SmartChartLoader,
  ChartDashboardWithProgressiveLoading,
  useChartProgressiveLoading,
  ChartPerformanceUtils
} from './components/LazyCharts'

// Hooks (when added)
// export { useChartData } from './hooks/useChartData'
// export { useChartResize } from './hooks/useChartResize'
// export { useChartAnimation } from './hooks/useChartAnimation'

// Utilities (when added)
// export { 
//   formatChartData,
//   calculateChartBounds,
//   optimizeDataPoints,
//   generateChartColors
// } from './utils'

// Types (when added)
// export type {
//   ChartData,
//   ChartConfig,
//   ChartTheme,
//   ChartDimensions
// } from './types'

// Constants (when added)
// export { CHART_COLORS, CHART_THEMES } from './constants'