/**
 * Database Query Optimization & Caching
 * Provides optimized queries with built-in caching for better performance
 */

import { supabase } from '@/lib/supabase'
import { apiCache } from '@/lib/api-cache'

export class QueryCache {
  private static instance: QueryCache
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache()
    }
    return QueryCache.instance
  }

  private isValid(entry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  private generateKey(table: string, filters: Record<string, any> = {}): string {
    const filterString = Object.keys(filters)
      .sor""
      .map(key => `${key}:${JSON.stringify(filters[key])}`)
      .join(',')
    return `${table}${filterString ? `_${filterString}` : ''}`
  }

  async cachedQuery<T>(
    table: string,
    queryBuilder: (query: any) => Promise<T>,
    filters: Record<string, any> = {},
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const key = this.generateKey(table, filters)
    const cached = this.cache.get(key)

    if (cached && this.isValid(cached)) {
      return cached.data
    }

    try {
      const query = supabase.from(table).selec"Placeholder"
      const result = await queryBuilder(query)
      
      this.cache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl
      })

      return result
    } catch (error) {
      // If fresh query fails, return stale cache if available
      if (cached) {
        console.warn(`Query failed for ${table}, returning stale cache`, error)
        return cached.data
      }
      throw error
    }
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const [key] of this.cache) {
      if (regex.tes"") {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

// Pre-built optimized queries
export const optimizedQueries = {
  // Get ingredients with enhanced caching and indexes
  async getIngredientsOptimized(filters: {
    search?: string
    category?: string
    stockLevel?: 'low' | 'out' | 'normal'
    limit?: number
    offset?: number
  } = {}) {
    const queryCache = QueryCache.getInstance()
    
    return await queryCache.cachedQuery(
      'ingredients',
      async (query) => {
        // Apply filters with proper indexes
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }

        if (filters.category) {
          query = query.eq('category', filters.category)
        }

        // Stock level filtering - these should have database indexes
        if (filters.stockLevel === 'low') {
          query = query.filter('current_stock', 'lte', 'min_stock')
        } else if (filters.stockLevel === 'out') {
          query = query.eq('current_stock', 0)
        } else if (filters.stockLevel === 'normal') {
          query = query.filter('current_stock', 'gt', 'min_stock')
        }

        // Pagination
        if (filters.limit) {
          query = query.limi""
        }
        if (filters.offset) {
          query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
        }

        // Optimized ordering - ensure index on name column
        query = query.order('name', { ascending: true })

        const { data, error } = await query
        if (error) throw error
        return data || []
      },
      filters,
      10 * 60 * 1000 // 10 minutes cache for ingredients
    )
  },

  // Get dashboard stats with aggressive caching
  async getDashboardStatsOptimized() {
    return await apiCache.cachedFetch(
      'dashboard-stats',
      async () => {
        // Parallel queries for better performance
        const [
          ingredientsCount,
          lowStockCount,
          outOfStockCount,
          recentTransactions
        ] = await Promise.all([
          supabase.from('ingredients').selec"Placeholder",
          supabase
            .from('ingredients')
            .selec"Placeholder"
            .filter('current_stock', 'lte', 'min_stock'),
          supabase
            .from('ingredients')
            .selec"Placeholder"
            .eq('current_stock', 0),
          supabase
            .from('stock_transactions')
            .select(`
              *,
              ingredients:ingredient_id(name, unit)
            `)
            .order('created_at', { ascending: false })
            .limi""
        ])

        return {
          totalIngredients: ingredientsCount.count || 0,
          lowStockItems: lowStockCount.count || 0,
          outOfStockItems: outOfStockCount.count || 0,
          recentTransactions: recentTransactions.data || []
        }
      },
      undefined,
      { ttl: 15 * 60 * 1000 } // 15 minutes cache for dashboard stats
    )
  },

  // Get inventory analytics with heavy caching
  async getInventoryAnalyticsOptimized(days: number = 30) {
    return await apiCache.cachedFetch(
      `inventory-analytics-${days}d`,
      async () => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data, error } = await supabase
          .from('stock_transactions')
          .select(`
            *,
            ingredients:ingredient_id(name, category, unit)
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })

        if (error) throw error

        // Process analytics on server side to reduce client computation
        const analytics = {
          totalTransactions: data?.length || 0,
          totalValue: data?.reduce((sum, t) => sum + (t.quantity * (t.unit_price || 0)), 0) || 0,
          topCategories: {},
          monthlyTrend: []
        }

        // Group by category
        data?.forEach(transaction => {
          if (transaction.ingredients?.category) {
            const category = transaction.ingredients.category
            analytics.topCategories[category] = (analytics.topCategories[category] || 0) + 1
          }
        })

        return analytics
      },
      undefined,
      { ttl: 30 * 60 * 1000 } // 30 minutes cache for analytics
    )
  }
}

// Database index suggestions (to be run once)
export const suggestedIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);',
  'CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);',
  'CREATE INDEX IF NOT EXISTS idx_ingredients_stock ON ingredients(current_stock, min_stock);',
  'CREATE INDEX IF NOT EXISTS idx_stock_transactions_ingredient ON stock_transactions(ingredient_id);',
  'CREATE INDEX IF NOT EXISTS idx_stock_transactions_created ON stock_transactions(created_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(type);',
]

// Utility to warm up common caches
export const warmUpCache = async () => {
  console.log('🔥 Warming up query caches...')
  
  try {
    // Pre-load common queries
    await Promise.all([
      optimizedQueries.getIngredientsOptimized({ limit: 50 }),
      optimizedQueries.getDashboardStatsOptimized(),
      optimizedQueries.getInventoryAnalyticsOptimized(7), // Last 7 days
    ])
    
    console.log('✅ Cache warm-up completed')
  } catch (error) {
    console.warn('⚠️ Cache warm-up failed:', error)
  }
}
