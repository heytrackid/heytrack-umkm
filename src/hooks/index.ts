/**
 * Barrel export for all hooks
 * Provides convenient single-import access to all custom hooks
 * 
 * Usage:
 *   import { useResponsive, useSupabase, useAuth } from '@/hooks'
 */

// UI Hooks
export { useResponsive, useMobile, useIsMobile, useMediaQuery, useScreenSize, useOrientation, useTouchDevice } from './useResponsive'
export { useSidebar } from './useSidebar'
export { useLoading } from './useLoading'
export { useConfirm } from './useConfirm'
export { useToast } from './use-toast'

// Error Handling Hooks
export { useErrorHandler, useAsyncError, useFormErrors, useRetry } from './useErrorHandler'

// Auth Hooks
export { useAuth } from './useAuth'
export { useSupabaseClient } from './useSupabaseClient'

// Database Hooks
export {
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseBulkOperations,
  useIngredients,
  useRecipes,
  useOrders,
  useCustomers,
  useFinancialRecords,
  useProductions,
  useSupabaseCRUD,
} from './useSupabase'

// Business Logic Hooks
export { useCurrency } from './useCurrency'
export { useExpenses } from './useExpenses'
export { useEnhancedCRUD } from './useEnhancedCRUD'
// export { useOptimizedDatabase } from './useOptimizedDatabase' // Deprecated
export { useAIPowered } from './useAIPowered'

// Performance Hooks
export { useRoutePreloading } from './useRoutePreloading'
// export { useSimplePreloading } from './useSimplePreloading' // Not available

// API Hooks
// export { useDashboard } from './api/useDashboard' // Not available
// export { useHPP } from './api/useHPP' // Not available
export { useHPPAlerts } from './api/useHPPAlerts'
export { useHPPComparison } from './api/useHPPComparison'
export { useHPPExport } from './api/useHPPExport'
export { useHPPSnapshots } from './api/useHPPSnapshots'
