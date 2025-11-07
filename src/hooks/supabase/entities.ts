'use client'

import { useSupabaseQuery } from './core'

import type { UseSupabaseQueryResult } from './types'

/**
 * Entity-specific hooks for common database operations
 */

// Ingredients
export function useIngredients(options?: { realtime?: boolean }): UseSupabaseQueryResult<'ingredients'> {
  return useSupabaseQuery('ingredients', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Recipes
export function useRecipes(options?: { realtime?: boolean }): UseSupabaseQueryResult<'recipes'> {
  return useSupabaseQuery('recipes', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Orders
export function useOrders(options?: { realtime?: boolean }): UseSupabaseQueryResult<'orders'> {
  return useSupabaseQuery('orders', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}

// Customers
export function useCustomers(options?: { realtime?: boolean }): UseSupabaseQueryResult<'customers'> {
  return useSupabaseQuery('customers', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Suppliers
export function useSuppliers(options?: { realtime?: boolean }): UseSupabaseQueryResult<'suppliers'> {
  return useSupabaseQuery('suppliers', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Expenses
export function useExpenses(options?: { realtime?: boolean }): UseSupabaseQueryResult<'expenses'> {
  return useSupabaseQuery('expenses', {
    orderBy: { column: 'expense_date', ascending: false },
    realtime: options?.realtime,
  })
}

// Operational Costs
export function useOperationalCosts(options?: { realtime?: boolean }): UseSupabaseQueryResult<'operational_costs'> {
  return useSupabaseQuery('operational_costs', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}

// Financial Records
export function useFinancialRecords(options?: {
  startDate?: string
  endDate?: string
  type?: 'EXPENSE' | 'INCOME' | 'INVESTMENT' | 'WITHDRAWAL'
  realtime?: boolean
}): UseSupabaseQueryResult<'financial_records'> {
  const filter: Record<string, unknown> = {}
  if (options?.type) {filter['type'] = options.type}

  return useSupabaseQuery('financial_records', {
    filter,
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}

// Productions
export function useProductions(options?: { realtime?: boolean }): UseSupabaseQueryResult<'productions'> {
  return useSupabaseQuery('productions', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}
