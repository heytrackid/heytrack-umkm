/**
 * Enhanced Optimized API Client with Database Index Integration
 * Combines caching, request deduplication, and optimized database queries
 * Created: 2025-01-29
 */

import { QueryOptimizer, QueryPerformanceMonitor } from './query-optimization';

// Cache interface for better type safety
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

class EnhancedApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default TTL
      maxSize: 100, // Max 100 cached entries
      ...config,
    };
  }

  // Generate cache key from query parameters
  private generateCacheKey(operation: string, params: any = {}): string {
    const sortedParams = Object.keys(params)
      .sor""
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);
    
    return `${operation}:${JSON.stringify(sortedParams)}`;
  }

  // Check if cache entry is valid
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Get data from cache
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isCacheValid(entry)) {
      return entry.data;
    } else {
      // Remove expired entry
      this.cache.delete(key);
      return null;
    }
  }

  // Set data to cache with TTL
  private setCache<T>(key: string, data: T, ttl?: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().nex"".value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    });
  }

  // Generic fetch method with caching and performance monitoring
  private async fetchWithCache<T>(
    operationName: string,
    queryFn: () => Promise<any>,
    cacheKey: string,
    ttl?: number,
    useCache: boolean = true
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Check if request is already pending (deduplication)
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(key);
    }

    // Execute with performance monitoring
    const requestPromise = QueryPerformanceMonitor.measureQuery(
      operationName,
      async () => {
        const result = await queryFn();
        return result.data || result;
      }
    )
      .then(({ result }) => {
        // Cache the result
        if (useCache) {
          this.setCache(cacheKey, result, ttl);
        }
        return result;
      })
      .finally(() => {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      });

    // Store pending request for deduplication
    pendingRequests.set(key: string, data: any, ttl: number = 300000): void {;

    return requestPromise;
  }

  /**
   * Enhanced Ingredients API using optimized queries
   */
  async getIngredients(options: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    ttl?: number;
    useCache?: boolean;
  } = {}) {
    const { search, category, lowStock, ttl = 2 * 60 * 1000, useCache = true } = options;
    const cacheKey = this.generateCacheKey('ingredients', { search, category, lowStock });

    return this.fetchWithCache(
      'get-ingredients',
      async () => {
        if (search) {
          return QueryOptimizer.ingredients.searchByName(search);
        } else if (category) {
          return QueryOptimizer.ingredients.getByCategory(category);
        } else if (lowStock) {
          return QueryOptimizer.ingredients.getLowStockIngredients();
        } else {
          return QueryOptimizer.ingredients.getStockStatus();
        }
      },
      cacheKey,
      ttl,
      useCache
    );
  }

  async getIngredientsBySupplier(supplier: string) {
    const cacheKey = this.generateCacheKey('ingredients-supplier', { supplier });
    
    return this.fetchWithCache(
      'get-ingredients-by-supplier',
      () => QueryOptimizer.ingredients.getBySupplier(supplier),
      cacheKey
    );
  }

  async getIngredientsCostAnalysis() {
    const cacheKey = this.generateCacheKey('ingredients-cost-analysis');
    
    return this.fetchWithCache(
      'get-ingredients-cost-analysis',
      () => QueryOptimizer.ingredients.getCostAnalysis(),
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache for cost analysis
    );
  }

  /**
   * Enhanced Orders API using optimized queries
   */
  async getOrders(options: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    ttl?: number;
    useCache?: boolean;
  } = {}) {
    const { status, customerId, startDate, endDate, limit = 100, ttl = 1 * 60 * 1000, useCache = true } = options;
    const cacheKey = this.generateCacheKey('orders', { status, customerId, startDate, endDate, limit });

    return this.fetchWithCache(
      'get-orders',
      async () => {
        if (status) {
          return QueryOptimizer.orders.getByStatus(status, limit);
        } else if (customerId) {
          return QueryOptimizer.orders.getByCustomer(customerId);
        } else if (startDate && endDate) {
          return QueryOptimizer.orders.getByDateRange(startDate, endDate);
        } else {
          return QueryOptimizer.joins.getOrdersWithItems(limit);
        }
      },
      cacheKey,
      ttl,
      useCache
    );
  }

  async getUrgentOrders() {
    const cacheKey = this.generateCacheKey('orders-urgent');
    
    return this.fetchWithCache(
      'get-urgent-orders',
      () => QueryOptimizer.orders.getUrgentOrders(),
      cacheKey,
      30 * 1000 // 30 seconds cache for urgent orders
    );
  }

  async getOrdersAnalytics(startDate: string, endDate: string) {
    const cacheKey = this.generateCacheKey('orders-analytics', { startDate, endDate });
    
    return this.fetchWithCache(
      'get-orders-analytics',
      () => QueryOptimizer.orders.getAnalytics(startDate, endDate),
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache for analytics
    );
  }

  /**
   * Enhanced Recipes API using optimized queries
   */
  async getRecipes(options: {
    search?: string;
    category?: string;
    withIngredients?: boolean;
    ttl?: number;
    useCache?: boolean;
  } = {}) {
    const { search, category, withIngredients, ttl = 5 * 60 * 1000, useCache = true } = options;
    const cacheKey = this.generateCacheKey('recipes', { search, category, withIngredients });

    return this.fetchWithCache(
      'get-recipes',
      async () => {
        if (search) {
          return QueryOptimizer.recipes.searchByName(search);
        } else if (category) {
          return QueryOptimizer.recipes.getByCategory(category);
        } else if (withIngredients) {
          return QueryOptimizer.joins.getRecipesWithIngredients();
        } else {
          return QueryOptimizer.recipes.getActiveRecipes();
        }
      },
      cacheKey,
      ttl,
      useCache
    );
  }

  async getPopularRecipes(limit: number = 10) {
    const cacheKey = this.generateCacheKey('recipes-popular', { limit });
    
    return this.fetchWithCache(
      'get-popular-recipes',
      () => QueryOptimizer.recipes.getPopularRecipes(limit),
      cacheKey,
      10 * 60 * 1000 // 10 minutes cache for popular recipes
    );
  }

  async getRecipesProfitability() {
    const cacheKey = this.generateCacheKey('recipes-profitability');
    
    return this.fetchWithCache(
      'get-recipes-profitability',
      () => QueryOptimizer.recipes.getProfitabilityAnalysis(),
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache for profitability
    );
  }

  /**
   * Enhanced Customers API using optimized queries
   */
  async getCustomers(options: {
    search?: string;
    customerType?: string;
    ttl?: number;
    useCache?: boolean;
  } = {}) {
    const { search, customerType, ttl = 3 * 60 * 1000, useCache = true } = options;
    const cacheKey = this.generateCacheKey('customers', { search, customerType });

    return this.fetchWithCache(
      'get-customers',
      async () => {
        if (search) {
          return QueryOptimizer.customers.searchByName(search);
        } else if (customerType) {
          return QueryOptimizer.customers.getByType(customerType);
        } else {
          return QueryOptimizer.customers.getValueAnalysis();
        }
      },
      cacheKey,
      ttl,
      useCache
    );
  }

  async getCustomerByPhone(phone: string) {
    const cacheKey = this.generateCacheKey('customer-phone', { phone });
    
    return this.fetchWithCache(
      'get-customer-by-phone',
      () => QueryOptimizer.customers.getByPhone(phone),
      cacheKey
    );
  }

  async getTopCustomers(limit: number = 20) {
    const cacheKey = this.generateCacheKey('customers-top', { limit });
    
    return this.fetchWithCache(
      'get-top-customers',
      () => QueryOptimizer.customers.getTopCustomers(limit),
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache for top customers
    );
  }

  /**
   * Enhanced Financial API using optimized queries
   */
  async getFinancialRecords(options: {
    type?: 'INCOME' | 'EXPENSE';
    startDate?: string;
    endDate?: string;
    ttl?: number;
    useCache?: boolean;
  } = {}) {
    const { type, startDate, endDate, ttl = 2 * 60 * 1000, useCache = true } = options;
    const cacheKey = this.generateCacheKey('financial', { type, startDate, endDate });

    return this.fetchWithCache(
      'get-financial-records',
      () => QueryOptimizer.financial.getByType(type!, startDate, endDate),
      cacheKey,
      ttl,
      useCache
    );
  }

  async getFinancialCategoryBreakdown(startDate: string, endDate: string) {
    const cacheKey = this.generateCacheKey('financial-categories', { startDate, endDate });
    
    return this.fetchWithCache(
      'get-financial-category-breakdown',
      () => QueryOptimizer.financial.getCategoryBreakdown(startDate, endDate),
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache for category breakdown
    );
  }

  /**
   * Enhanced Dashboard API using optimized analytics queries
   */
  async getDashboardStats(startDate: string, endDate: string) {
    const cacheKey = this.generateCacheKey('dashboard-stats', { startDate, endDate });
    
    return this.fetchWithCache(
      'get-dashboard-stats',
      () => QueryOptimizer.analytics.getDashboardStats(startDate, endDate),
      cacheKey,
      1 * 60 * 1000 // 1 minute cache for dashboard
    );
  }

  /**
   * Global search across multiple entities
   */
  async globalSearch(searchTerm: string) {
    const cacheKey = this.generateCacheKey('global-search', { searchTerm });
    
    return this.fetchWithCache(
      'global-search',
      async () => {
        const [ingredients, recipes, orders, customers] = await Promise.all([
          QueryOptimizer.ingredients.searchByName(searchTerm, 10),
          QueryOptimizer.recipes.fullTextSearch(searchTerm),
          QueryOptimizer.orders.fullTextSearch(searchTerm),
          QueryOptimizer.customers.searchByName(searchTerm)
        ]);

        return {
          ingredients: ingredients.data || [],
          recipes: recipes.data || [],
          orders: orders.data || [],
          customers: customers.data || []
        };
      },
      cacheKey,
      2 * 60 * 1000 // 2 minutes cache for search results
    );
  }

  /**
   * Production planning with optimized queries
   */
  async getProductionPlan(date: string) {
    const cacheKey = this.generateCacheKey('production-plan', { date });
    
    return this.fetchWithCache(
      'get-production-plan',
      async () => {
        const orders = await QueryOptimizer.orders.getDeliverySchedule(date);
        
        if (!orders.data) return { orders: [], recipeNeeds: [] };

        // Calculate recipe requirements
        const recipeNeeds = orders.data.reduce((acc: any, order: any) => {
          order.order_items?.forEach((item: any) => {
            if (acc[item.recipe_id]) {
              acc[item.recipe_id].quantity += item.quantity;
            } else {
              acc[item.recipe_id] = {
                recipeId: item.recipe_id,
                recipeName: item.recipes?.name,
                quantity: item.quantity,
                prepTime: item.recipes?.prep_time
              };
            }
          });
          return acc;
        }, {});

        return {
          orders: orders.data,
          recipeNeeds: Object.values(recipeNeeds)
        };
      },
      cacheKey,
      30 * 60 * 1000 // 30 minutes cache for production plans
    );
  }

  /**
   * Cache management methods
   */
  invalidateCache(patterns: string[]): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (patterns.some(pattern => key.includes(pattern))) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearCache(): void {
    this.cache.clear();
    pendingRequests.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Get query performance statistics
   */
  getPerformanceStats() {
    return QueryPerformanceMonitor.getAllQueryStats();
  }
}

// Create singleton instance
export const enhancedApiClient = new EnhancedApiClient({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // 100 cached entries max
});

// Export types and classes
export type { CacheConfig };
export { EnhancedApiClient, QueryPerformanceMonitor };
export default enhancedApiClient;