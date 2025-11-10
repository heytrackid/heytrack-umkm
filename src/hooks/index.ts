
/**
 * Barrel export for all hooks
 * Provides convenient single-import access to all custom hooks
 * 
 * Usage:
 *   import { useResponsive, useSupabase, useAuth } from '@/hooks/index'
 */

// UI Hooks
export { useIsMobile, useMediaQuery, useMobile, useOrientation, useResponsive, useScreenSize, useTouchDevice } from '@/utils/responsive'

// export { useLoading } from './useLoading'
export { useToast } from './use-toast'
export { useConfirm } from './useConfirm'

// Error Handling Hooks
// export { useErrorHandler, useAsyncError, useFormErrors, useRetry } from './useErrorHandler'

// Auth Hooks
export { useAuth } from '@/providers/AuthProvider'

// Database Hooks
export {
    useCustomers, useFinancialRecords, useIngredients, useOrders, useRecipes, useSupabaseBulk, useSupabaseCRUD, useSupabaseQuery, useSuppliers
} from './supabase'

// Business Logic Hooks
export { useCurrency } from './useCurrency'
// export { useEnhancedCRUD } from './useEnhancedCRUD'
// export { UseAIPowered as useAIPowered } from './useAIPowered'

// Performance Hooks
export { useAdvancedButtonPreloading, useAdvancedLinkPreloading, useSimplePreload } from './usePreloading'

// API Hooks
export { useDashboardStats, useTopProducts, useWeeklySales } from './api/useDashboard'
export { useHPPAlerts } from './api/useHPPAlerts'
export { useHPPComparison } from './api/useHPPComparison'
export { useHPPExport } from './api/useHPPExport'
export { useHPPSnapshots } from './api/useHPPSnapshots'

// HPP Hooks
export { useHppOverview } from '@/modules/hpp/hooks/useHppOverview'
export { useHppWorker } from '@/modules/hpp/hooks/useHppWorker'

// Inventory Hooks
export { useIngredientStockStatus, useInventoryAlerts } from './useInventoryAlerts'
export { usePurchaseOrderGenerator, useReorderManagement } from './useReorderManagement'

// HPP Automation Hooks
// export { useHPPAutomation, useRecipeHPPAnalysis } from './useHPPAutomation'

// Performance Hooks
export { usePerformanceMonitoring } from '@/lib/performance'
