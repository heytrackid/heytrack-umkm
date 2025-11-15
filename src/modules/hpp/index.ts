

/**
 * HPP (Harga Pokok Produksi) Module
 * Centralized module for all HPP-related functionality
 */

// Components
export { HppQuickSummary } from './components/HppQuickSummary'
export { UnifiedHppPage } from './components/UnifiedHppPage'

// Services
// NOTE: Server-only services are NOT exported from this barrel file
// to prevent client components from accidentally importing them.
// Import directly from the service file in API routes/server components:
// - import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

// Hooks
export { useHppCalculatorWorker } from './hooks/useHppCalculatorWorker'
export { useHppOverview } from './hooks/useHppOverview'
export { useHppWorker } from './hooks/useHppWorker'
export { useUnifiedHpp } from './hooks/useUnifiedHpp'

// Types
export type * from './types'
