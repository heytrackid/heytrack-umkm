'use client'

import { useSupabaseQuery } from './core'



/**
 * Entity-specific hooks for common database operations
 */

// Ingredients
export function useIngredients(options?: { realtime?: boolean }) {
  return useSupabaseQuery('ingredients', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Recipes
export function useRecipes(options?: { realtime?: boolean }) {
  return useSupabaseQuery('recipes', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Orders
export function useOrders(options?: { realtime?: boolean }) {
  return useSupabaseQuery('orders', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}

// Customers
export function useCustomers(options?: { realtime?: boolean }) {
  return useSupabaseQuery('customers', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Suppliers
export function useSuppliers(options?: { realtime?: boolean }) {
  return useSupabaseQuery('suppliers', {
    orderBy: { column: 'name' },
    realtime: options?.realtime,
  })
}

// Expenses
export function useExpenses(options?: { realtime?: boolean }) {
  return useSupabaseQuery('expenses', {
    orderBy: { column: 'expense_date', ascending: false },
    realtime: options?.realtime,
  })
}

// Operational Costs
export function useOperationalCosts(options?: { realtime?: boolean }) {
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
}) {
  const filter: Record<string, unknown> = {}
  if (options?.type) {filter['type'] = options.type}

  return useSupabaseQuery('financial_records', {
    filter,
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}

// Productions
export function useProductions(options?: { realtime?: boolean }) {
  return useSupabaseQuery('productions', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: options?.realtime,
  })
}
