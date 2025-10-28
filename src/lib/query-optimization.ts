/**
 * Query Optimization Utilities
 * Helpers for optimizing database queries
 */

import { dbLogger } from '@/lib/logger'

type PostgrestFilterBuilder<T = unknown> = {
  eq: (column: string, value: unknown) => PostgrestFilterBuilder<T>
  gte: (column: string, value: unknown) => PostgrestFilterBuilder<T>
  lte: (column: string, value: unknown) => PostgrestFilterBuilder<T>
  range: (from: number, to: number) => PostgrestFilterBuilder<T>
  ilike: (column: string, pattern: string) => PostgrestFilterBuilder<T>
  filter?: (column: string, operator: string, value: unknown) => PostgrestFilterBuilder<T>
}

/**
 * Select only needed fields to reduce payload size
 */
export const selectFields = {
  // Minimal recipe fields
  recipeMinimal: 'id, name, batch_size, total_cost, is_active',

  // Recipe with ingredients
  recipeWithIngredients: `
    id,
    name,
    description,
    batch_size,
    total_cost,
    is_active,
    created_at,
    recipe_ingredients (
      id,
      quantity,
      ingredient:ingredients (
        id,
        name,
        unit,
        price_per_unit
      )
    )
  `,

  // Minimal order fields
  orderMinimal: 'id, order_number, customer_id, status, total_amount, created_at',

  // Order with details
  orderWithDetails: `
    id,
    order_number,
    customer_id,
    status,
    payment_status,
    total_amount,
    paid_amount,
    discount,
    tax_amount,
    delivery_fee,
    notes,
    created_at,
    customer:customers (
      id,
      name,
      phone,
      email
    ),
    order_items (
      id,
      recipe_id,
      quantity,
      unit_price,
      subtotal,
      recipe:recipes (
        id,
        name
      )
    )
  `,

  // Minimal ingredient fields
  ingredientMinimal: 'id, name, unit, current_stock, price_per_unit',

  // Ingredient with purchases
  ingredientWithPurchases: `
    id,
    name,
    unit,
    current_stock,
    min_stock,
    price_per_unit,
    created_at,
    ingredient_purchases (
      id,
      quantity,
      price_per_unit,
      purchase_date
    )
  `,

  // HPP snapshot minimal
  hppSnapshotMinimal: 'id, recipe_id, snapshot_date, total_cost, material_cost',

  // HPP alert minimal
  hppAlertMinimal: 'id, recipe_id, alert_type, severity, is_read, created_at'
}

/**
 * Common query filters
 */
export const queryFilters = {
  // Active records only
  activeOnly: <T>(query: PostgrestFilterBuilder<T>) => query.eq('is_active', true),

  // By date range
  dateRange: <T>(
    query: PostgrestFilterBuilder<T>,
    field: string,
    from: string,
    to: string
  ) => query.gte(field, from).lte(field, to),

  // Recent records
  recent: <T>(
    query: PostgrestFilterBuilder<T>,
    field: string,
    days: number
  ) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return query.gte(field, date.toISOString())
  },

  // Paginated
  paginated: <T>(
    query: PostgrestFilterBuilder<T>,
    page: number,
    pageSize: number
  ) => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    return query.range(from, to)
  }
}

/**
 * Query builder helpers
 */
export const queryBuilder = {
  // Build order query with filters
  buildOrderQuery: (
    baseQuery: any,
    filters: {
      status?: string
      paymentStatus?: string
      customerId?: string
      dateFrom?: string
      dateTo?: string
    }
  ) => {
    let query = baseQuery

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus)
    }

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId)
    }

    if (filters.dateFrom && filters.dateTo) {
      query = queryFilters.dateRange(query, 'created_at', filters.dateFrom, filters.dateTo)
    }

    return query
  },

  // Build recipe query with filters
  buildRecipeQuery: (
    baseQuery: any,
    filters: {
      isActive?: boolean
      search?: string
    }
  ) => {
    let query = baseQuery

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    return query
  },

  // Build ingredient query with filters
  buildIngredientQuery: (
    baseQuery: any,
    filters: {
      lowStock?: boolean
      search?: string
    }
  ) => {
    let query = baseQuery

    if (filters.lowStock) {
      query = query.filter('current_stock', 'lt', 'min_stock')
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    return query
  }
}

/**
 * Batch operations
 */
export const batchOperations = {
  // Batch insert with chunks
  async batchInsert<T>(
    supabase: any,
    table: string,
    data: T[],
    chunkSize = 100
  ): Promise<{ success: boolean; errors: any[] }> {
    const errors: any[] = []

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)

      const { error } = await supabase.from(table).insert(chunk)

      if (error) {
        errors.push({ chunk: i / chunkSize, error })
      }
    }

    return {
      success: errors.length === 0,
      errors
    }
  },

  // Batch update with chunks
  async batchUpdate<T extends { id: string }>(
    supabase: any,
    table: string,
    data: T[],
    chunkSize = 100
  ): Promise<{ success: boolean; errors: any[] }> {
    const errors: any[] = []

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)

      for (const item of chunk) {
        const { id, ...updateData } = item
        const { error } = await supabase.from(table).update(updateData).eq('id', id)

        if (error) {
          errors.push({ id, error })
        }
      }
    }

    return {
      success: errors.length === 0,
      errors
    }
  },

  // Batch delete
  async batchDelete(
    supabase: any,
    table: string,
    ids: string[]
  ): Promise<{ success: boolean; errors: any[] }> {
    const errors: any[] = []

    const { error } = await supabase.from(table).delete().in('id', ids)

    if (error) {
      errors.push(error)
    }

    return {
      success: errors.length === 0,
      errors
    }
  }
}

/**
 * Query performance monitoring
 */
export class QueryMonitor {
  private queries: Map<string, { count: number; totalTime: number }> = new Map()

  start(queryName: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      const existing = this.queries.get(queryName) || { count: 0, totalTime: 0 }
      this.queries.set(queryName, {
        count: existing.count + 1,
        totalTime: existing.totalTime + duration
      })

      if (process.env.NODE_ENV === 'development') {
        dbLogger.info({ queryName, duration: `${duration.toFixed(2)}ms` }, 'Query executed')
      }
    }
  }

  getStats() {
    const stats: Record<string, { count: number; avgTime: number; totalTime: number }> = {}

    this.queries.forEach((value, key) => {
      stats[key] = {
        count: value.count,
        avgTime: value.totalTime / value.count,
        totalTime: value.totalTime
      }
    })

    return stats
  }

  reset() {
    this.queries.clear()
  }
}

export const queryMonitor = new QueryMonitor()
