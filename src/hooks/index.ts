/**
 * Central export file for all custom hooks
 * 
 * This file provides a single import point for all hooks used throughout the application.
 * 
 * Usage:
 *   import { useResponsive, useSupabase } from '@/hooks/index'
 */

// Auth Hook (No Auth Mode)
export { useAuth } from './useAuth'

// Database Hooks - ALL API-based versions
// export { useCategories } from './useCategories' // TODO: File missing
export { useCustomers } from './useCustomers'
export { useIngredientPurchases } from './useIngredientPurchases'
export { useIngredients } from './useIngredients'
export { useOperationalCosts } from './useOperationalCosts'
// export { useOrders } from './useOrders' // TODO: File missing - use useOrdersQuery instead
// export { useProductionBatches } from './useProductionBatches' // TODO: File missing
export { useRecipes } from './useRecipes'
export { useSuppliers } from './useSuppliers'

// Utility Hooks
export { useChatHistory } from './useChatHistory'
export { useCurrency } from './useCurrency'
export { useDebounce } from './useDebounce'
export { useInstantNavigation } from './useInstantNavigation'
// export { useLocalStorage } from './useLocalStorage' // TODO: File missing
export { useNotifications } from './useNotifications'

// Dashboard Hooks
// export { useDashboard } from './api/useDashboard' // TODO: File missing or export missing

// Supabase Hooks
export { useSupabaseQuery } from './supabase/core'
export { useSupabaseCRUD } from './supabase/useSupabaseCRUD'

// Re-export from shadcn/ui
export { useToast } from './use-toast'

