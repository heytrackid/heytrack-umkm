/**
 * Mobile Charts - Refactored for Modularity
 * Re-exports from modular chart system for backward compatibility
 */

// Re-export all chart components and utilities from the modular system
export * from './charts'

// Re-export specific components with backward-compatible names
export {
  BaseMobileChart as BaseMobileChart,
  MobileTooltip as MobileTooltip,
  MobileLineChart as MobileLineChart,
  MobileAreaChart as MobileAreaChart,
  MobileBarChart as MobileBarChart,
  MobilePieChart as MobilePieChart,
  MiniChart as MiniChart
} from './charts'

// Re-export types and constants
export type {
  ChartDataPoint,
  TooltipEntry,
  PieLabelProps,
  BaseMobileChartProps
} from './charts'

export { CHART_COLORS } from './charts'