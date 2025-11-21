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
export { useCustomers } from './useCustomers'
export { useIngredientPurchases } from './useIngredientPurchases'
export { useIngredients } from './useIngredients'
export { useOperationalCosts } from './useOperationalCosts'
export { useOrder, useOrders, useOrderStats } from './useOrdersQuery'
export { useRecipes } from './useRecipes'
export { useSuppliers } from './useSuppliers'

// Utility Hooks
export { useChatHistory } from './useChatHistory'
export { useCurrency } from './useCurrency'
export { useDebounce } from './useDebounce'
export { useInstantNavigation } from './useInstantNavigation'


// Dashboard Hooks
export { useDashboardStats, useTopProducts, useWeeklySales } from './api/useDashboard'
export type { DashboardStats, TopProductsData, WeeklySalesData } from './api/useDashboard'

// Supabase Hooks
export { useSupabaseQuery } from './supabase/core'
export { useSupabaseCRUD } from './supabase/useSupabaseCRUD'

// Toast utilities now available from @/lib/toast

