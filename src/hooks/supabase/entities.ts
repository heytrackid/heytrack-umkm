'use client'

import { useSupabaseQuery } from '@/hooks/supabase/core'

import type { UseSupabaseQueryOptions, UseSupabaseQueryResult } from '@/hooks/supabase/types'

/**
 * Entity-specific hooks for common database operations
 */

// Ingredients
export function useIngredients(options?: { realtime?: boolean }): UseSupabaseQueryResult<'ingredients'> {
  const queryOptions: UseSupabaseQueryOptions<'ingredients'> = {
    orderBy: { column: 'name' },
  }
  if (options?.realtime !== undefined) {
    queryOptions.realtime = options.realtime
  }
  return useSupabaseQuery('ingredients', queryOptions)
}

// Recipes
export function useRecipes(options?: { realtime?: boolean }): UseSupabaseQueryResult<'recipes'> {
  return useSupabaseQuery('recipes', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Orders
export function useOrders(options?: { realtime?: boolean }): UseSupabaseQueryResult<'orders'> {
  return useSupabaseQuery('orders', {
    orderBy: { column: 'created_at', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Customers
export function useCustomers(options?: { realtime?: boolean }): UseSupabaseQueryResult<'customers'> {
  return useSupabaseQuery('customers', {
    orderBy: { column: 'name' },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Suppliers
export function useSuppliers(options?: { realtime?: boolean }): UseSupabaseQueryResult<'suppliers'> {
  return useSupabaseQuery('suppliers', {
    orderBy: { column: 'name' },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Financial Records (replaces Expenses)
export function useFinancialRecords(
  filter?: Record<string, unknown>,
  options?: { realtime?: boolean }
): UseSupabaseQueryResult<'financial_records'> {
  return useSupabaseQuery('financial_records', {
    filter,
    orderBy: { column: 'date', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Operational Costs
export function useOperationalCosts(options?: { realtime?: boolean }): UseSupabaseQueryResult<'operational_costs'> {
  return useSupabaseQuery('operational_costs', {
    orderBy: { column: 'created_at', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Productions
export function useProductions(options?: { realtime?: boolean }): UseSupabaseQueryResult<'productions'> {
  return useSupabaseQuery('productions', {
    orderBy: { column: 'created_at', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}



