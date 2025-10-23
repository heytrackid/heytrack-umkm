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

// Auth Hooks
export { useAuth } from './useAuth'
export { useSupabaseClient } from './useSupabaseClient'

// Database Hooks
export {
  useSupabaseQuery,
  useSupabaseMutation,
  useSupabaseAnalytics,
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
export { useOptimizedDatabase } from './useOptimizedDatabase'
export { useAIPowered } from './useAIPowered'

// Performance Hooks
export { useRoutePreloading } from './useRoutePreloading'
export { useSimplePreloading } from './useSimplePreloading'

// API Hooks
export { useDashboard } from './api/useDashboard'
export { useHPP } from './api/useHPP'
export { useHPPAlerts } from './api/useHPPAlerts'
export { useHPPComparison } from './api/useHPPComparison'
export { useHPPExport } from './api/useHPPExport'
export { useHPPSnapshots } from './api/useHPPSnapshots'
