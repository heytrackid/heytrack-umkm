/**
 * HPP (Harga Pokok Produksi) Module
 * Centralized module for all HPP-related functionality
 */

// Components
export { UnifiedHppPage } from './components/UnifiedHppPage'
export { HppCostTrendsChart } from './components/HppCostTrendsChart'
// export { HppQuickStats } from './components/HppQuickStats' // File doesn't exist
// export { RecentSnapshotsTable } from './components/RecentSnapshotsTable' // File doesn't exist

// Services
// HppCalculatorService moved to @/services/hpp/HppCalculatorService (consolidated)
export { HppCalculatorService } from '@/services/hpp/HppCalculatorService'
export { HppExportService } from './services/HppExportService'
export { HppSnapshotService } from './services/HppSnapshotService'
export { HppAlertService } from './services/HppAlertService'
export { HppSnapshotAutomation } from './services/HppSnapshotAutomation'

// Hooks
export { useUnifiedHpp } from './hooks/useUnifiedHpp'
export { useHppOverview } from './hooks/useHppOverview'
export { useHppCalculatorWorker } from './hooks/useHppCalculatorWorker'
export { useHppWorker } from './hooks/useHppWorker'
export { useInfiniteHppAlerts } from './hooks/useInfiniteHppAlerts'

// Types
export type * from './types'
