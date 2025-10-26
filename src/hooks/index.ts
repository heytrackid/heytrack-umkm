/**
 * Barrel export for all hooks
 * Provides convenient single-import access to all custom hooks
 * 
 * Usage:
 *   import { useResponsive, useSupabase, useAuth } from '@/hooks'
 */

// UI Hooks
export { useResponsive, useMobile, useIsMobile, useMediaQuery, useScreenSize, useOrientation, useTouchDevice } from './useResponsive'
// export { useSidebar } from './useSidebar'
// export { useLoading } from './useLoading'
export { useConfirm } from './useConfirm'
export { useToast } from './use-toast'

// Error Handling Hooks
// export { useErrorHandler, useAsyncError, useFormErrors, useRetry } from './useErrorHandler'

// Auth Hooks
export { useAuth } from './useAuth'

// Database Hooks
export {
  useSupabaseQuery,
  useSupabaseCRUD,
  useSupabaseBulk,
  useIngredients,
  useRecipes,
  useOrders,
  useCustomers,
  useSuppliers,
  useExpenses,
} from './supabase'

// Business Logic Hooks
export { useCurrency } from './useCurrency'
// export { useEnhancedCRUD } from './useEnhancedCRUD'
// export { default as useAIPowered } from './useAIPowered'

// Performance Hooks
export { useRoutePreloading } from './useRoutePreloading'

// API Hooks
export { useHPPAlerts } from './api/useHPPAlerts'
export { useHPPComparison } from './api/useHPPComparison'
export { useHPPExport } from './api/useHPPExport'
export { useHPPSnapshots } from './api/useHPPSnapshots'

// Inventory Hooks
export { useInventoryAlerts, useIngredientStockStatus } from './useInventoryAlerts'
export { useReorderManagement, usePurchaseOrderGenerator } from './useReorderManagement'

// HPP Automation Hooks
// export { useHPPAutomation, useRecipeHPPAnalysis } from './useHPPAutomation'

// Performance Hooks
export { useServiceWorker } from './useServiceWorker'
export { usePerformanceMonitoring } from './usePerformanceMonitoring'
