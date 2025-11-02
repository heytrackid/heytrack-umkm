

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
// NOTE: Server-only services are NOT exported from this barrel file
// to prevent client components from accidentally importing them.
// Import directly from the service file in API routes/server components:
// - import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

// Hooks
export { useUnifiedHpp } from './hooks/useUnifiedHpp'
export { useHppOverview } from './hooks/useHppOverview'
export { useHppCalculatorWorker } from './hooks/useHppCalculatorWorker'
export { useHppWorker } from './hooks/useHppWorker'

// Types
export type * from './types'
