// Main component
export { default as HPPHistoricalChart } from './HPPHistoricalChart'

// Hooks
export { useHPPSnapshotsData } from './useHPPSnapshotsData'
export { useMultiSelectState } from './useMultiSelectState'

// Utilities
export {
    PERIOD_OPTIONS,
    CHART_COLORS,
    MULTI_PRODUCT_COLORS,
    formatSingleProductChartData,
    formatMultiProductChartData,
    calculateSingleProductStats,
    calculateMultiProductStats,
    getTrendIcon,
    getTrendColor,
    getTrendLabel
} from './chartUtils'

// Types
export type { ChartStatistics, ChartDataPoint } from './chartUtils'

// Components
export { CustomTooltip } from './CustomTooltip'
export { LoadingState, ErrorState, EmptyState } from './ChartStates'
export { ProductSelector } from './ProductSelector'
export { PeriodFilter } from './PeriodFilter'
export { ChartRenderer } from './ChartRenderer'
export { StatisticsDisplay } from './StatisticsDisplay'
