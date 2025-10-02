/**
 * Query Optimization Utilities
 * Provides optimized database queries leveraging the new indexes
 * Created: 2025-01-29
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Query builder with optimized patterns
export class QueryOptimizer {
  
  /**
   * Optimized ingredients queries leveraging indexes
   */
  static ingredients = {
    // Uses idx_ingredients_name_text_ops for fast text search
    searchByName: (searchTerm: string, limit: number = 50) => {
      return supabase
        .from('ingredients')
        .select('*')
        .textSearch('name', searchTerm)
        .eq('is_active', true)
        .order('name')
        .limit(limit);
    },

    // Uses idx_ingredients_category for fast category filtering
    getByCategory: (category: string) => {
      return supabase
        .from('ingredients')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('current_stock', { ascending: false });
    },

    // Uses idx_ingredients_low_stock for critical inventory queries
    getLowStockIngredients: () => {
      return supabase
        .from('ingredients')
        .select('*')
        .filter('current_stock', 'lte', 'min_stock')
        .eq('is_active', true)
        .order('current_stock', { ascending: true });
    },

    // Uses idx_ingredients_stock_status for efficient stock queries
    getStockStatus: () => {
      return supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)
        .order('current_stock', { ascending: true });
    },

    // Uses idx_ingredients_supplier for supplier-based queries
    getBySupplier: (supplier: string) => {
      return supabase
        .from('ingredients')
        .select('*')
        .eq('supplier', supplier)
        .eq('is_active', true)
        .order('name');
    },

    // Uses idx_ingredients_cost_analysis for cost analysis
    getCostAnalysis: () => {
      return supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)
        .gte(0)
        .order('total_value', { ascending: false });
    }
  };

  /**
   * Optimized orders queries leveraging indexes
   */
  static orders = {
    // Uses idx_orders_status for fast status filtering
    getByStatus: (status: string, limit: number = 100) => {
      return supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);
    },

    // Uses idx_orders_customer_id for customer order lookup
    getByCustomer: (customerId: string) => {
      return supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
    },

    // Uses idx_orders_created_at for date range queries
    getByDateRange: (startDate: string, endDate: string) => {
      return supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
    },

    // Uses idx_orders_delivery_date for production planning
    getDeliverySchedule: (date: string) => {
      return supabase
        .from('orders')
        .select('*')
        .eq('delivery_date', date)
        .in('status', ['CONFIRMED', 'IN_PROGRESS'])
        .order('delivery_time', { ascending: true });
    },

    // Uses idx_orders_priority_status for urgent orders
    getUrgentOrders: () => {
      return supabase
        .from('orders')
        .select('*')
        .in('priority', ['high', 'urgent'])
        .neq('status', 'DELIVERED')
        .order('delivery_date', { ascending: true });
    },

    // Uses idx_orders_full_text for comprehensive search
    fullTextSearch: (searchTerm: string) => {
      return supabase
        .from('orders')
        .select('*')
        .textSearch('customer_name,notes,order_no', searchTerm)
        .order('created_at', { ascending: false })
        .limit(50);
    },

    // Uses idx_orders_analytics for dashboard analytics
    getAnalytics: (startDate: string, endDate: string) => {
      return supabase
        .from('orders')
        .select('*')
        .eq('status', 'DELIVERED')
        .gte(0)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
    }
  };

  /**
   * Optimized recipes queries leveraging indexes
   */
  static recipes = {
    // Uses idx_recipes_name_text for fast text search
    searchByName: (searchTerm: string) => {
      return supabase
        .from('recipes')
        .select('*')
        .textSearch('name', searchTerm)
        .eq('is_active', true)
        .order('times_made', { ascending: false });
    },

    // Uses idx_recipes_category for category filtering
    getByCategory: (category: string) => {
      return supabase
        .from('recipes')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');
    },

    // Uses idx_recipes_active for active recipes
    getActiveRecipes: () => {
      return supabase
        .from('recipes')
        .select('*')
        .eq('is_active', true)
        .order('name');
    },

    // Uses idx_recipes_popularity for popular recipes
    getPopularRecipes: (limit: number = 10) => {
      return supabase
        .from('recipes')
        .select('*')
        .eq('is_active', true)
        .gte(0)
        .order('times_made', { ascending: false })
        .order('total_revenue', { ascending: false })
        .limit(limit);
    },

    // Uses idx_recipes_profitability for profitability analysis
    getProfitabilityAnalysis: () => {
      return supabase
        .from('recipes')
        .select('*')
        .eq('is_active', true)
        .gte(0)
        .order('total_revenue', { ascending: false });
    },

    // Uses idx_recipes_full_text for comprehensive search
    fullTextSearch: (searchTerm: string) => {
      return supabase
        .from('recipes')
        .select('*')
        .textSearch('name,description,category', searchTerm)
        .eq('is_active', true)
        .limit(50);
    }
  };

  /**
   * Optimized customers queries leveraging indexes
   */
  static customers = {
    // Uses idx_customers_name_text for fast name search
    searchByName: (searchTerm: string) => {
      return supabase
        .from('customers')
        .select('*')
        .textSearch('name', searchTerm)
        .eq('is_active', true)
        .order('total_spent', { ascending: false });
    },

    // Uses idx_customers_phone for phone lookup
    getByPhone: (phone: string) => {
      return supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();
    },

    // Uses idx_customers_email for email lookup
    getByEmail: (email: string) => {
      return supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();
    },

    // Uses idx_customers_type for customer type filtering
    getByType: (customerType: string) => {
      return supabase
        .from('customers')
        .select('*')
        .eq('customer_type', customerType)
        .eq('is_active', true)
        .order('total_spent', { ascending: false });
    },

    // Uses idx_customers_value_analysis for value analysis
    getValueAnalysis: () => {
      return supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .gte(0)
        .order('total_spent', { ascending: false });
    },

    // Uses idx_customers_active for top customers
    getTopCustomers: (limit: number = 20) => {
      return supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('total_spent', { ascending: false })
        .order('total_orders', { ascending: false })
        .limit(limit);
    }
  };

  /**
   * Optimized financial queries
   */
  static financial = {
    // Uses idx_financial_records_type for income/expense filtering
    getByType: (type: 'INCOME' | 'EXPENSE', startDate?: string, endDate?: string) => {
      let query = supabase
        .from('financial_records')
        .select('*')
        .eq('type', type)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      return query;
    },

    // Uses idx_financial_records_category for category breakdown
    getCategoryBreakdown: (startDate: string, endDate: string) => {
      return supabase
        .from('financial_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('category')
        .order('date', { ascending: false });
    },

    // Uses idx_financial_records_amount for large transactions
    getLargeTransactions: (minAmount: number = 1000000) => {
      return supabase
        .from('financial_records')
        .select('*')
        .gte(0)
        .order('amount', { ascending: false })
        .limit(50);
    }
  };

  /**
   * Optimized join queries leveraging foreign key indexes
   */
  static joins = {
    // Optimized order with items query
    getOrdersWithItems: (limit: number = 50) => {
      return supabase
        .from('orders')
        .select(`
          *,
          customers (name, phone, customer_type),
          order_items (
            quantity,
            unit_price,
            total_price,
            recipes (name, category)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
    },

    // Optimized recipe with ingredients query
    getRecipesWithIngredients: () => {
      return supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            quantity,
            unit,
            ingredients (name, current_stock, price_per_unit)
          )
        `)
        .eq('is_active', true)
        .order('name');
    },

    // Optimized ingredient usage across recipes
    getIngredientUsage: (ingredientId: string) => {
      return supabase
        .from('recipe_ingredients')
        .select(`
          quantity,
          unit,
          recipes (name, times_made, is_active)
        `)
        .eq('ingredient_id', ingredientId)
        .order('quantity', { ascending: false });
    }
  };

  /**
   * Dashboard analytics queries (optimized for performance)
   */
  static analytics = {
    // Fast dashboard stats query
    getDashboardStats: async (startDate: string, endDate: string) => {
      const [orders, ingredients, customers, revenue] = await Promise.all([
        // Uses idx_orders_created_at
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        
        // Uses idx_ingredients_low_stock  
        supabase
          .from('ingredients')
          .select('*')
          .filter('current_stock', 'lte', 'min_stock')
          .eq('is_active', true),
          
        // Uses idx_customers_active
        supabase
          .from('customers')
          .select('*')
          .eq('is_active', true),
          
        // Uses idx_orders_analytics
        supabase
          .from('orders')
          .select('*')
          .eq('status', 'DELIVERED')
          .gte(0)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ]);

      return {
        orders: orders.data || [],
        lowStockIngredients: ingredients.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        totalRevenue: revenue.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      };
    }
  };
}

/**
 * Query performance monitoring utilities
 */
export class QueryPerformanceMonitor {
  private static queryTimes: Map<string, number[]> = new Map();

  static async measureQuery<T>(
    queryName: string, 
    queryFn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      // Store query time for analysis
      const times = this.queryTimes.get(key) || [];
      times.push(duration);
      this.queryTimes.set(key, times.slice(-100)); // Keep last 100 measurements
      
      console.log(`Query"${queryName}" took ${duration.toFixed(2)}ms`);
      
      return { result, duration };
    } catch (error: any) {
      const duration = performance.now() - startTime;
      console.error(`Query"${queryName}" failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  static getQueryStats(queryName: string) {
    const times = this.queryTimes.get(key);
    if (!times || times.length === 0) return null;

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return {
      queryName,
      measurements: times.length,
      averageMs: Math.round(avg * 100) / 100,
      minMs: Math.round(min * 100) / 100,
      maxMs: Math.round(max * 100) / 100
    };
  }

  static getAllQueryStats() {
    return Array.from(this.queryTimes.keys()).map(name => this.getQueryStats(name)).filter(Boolean);
  }
}

/**
 * Common query patterns with optimizations
 */
export const OptimizedQueries = {
  // Search across multiple entities (uses text search indexes)
  globalSearch: async (searchTerm: string) => {
    const [ingredients, recipes, orders, customers] = await Promise.all([
      QueryOptimizer.ingredients.searchByName(searchTerm, 10),
      QueryOptimizer.recipes.searchByName(searchTerm),
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

  // Inventory alerts (uses optimized indexes)
  getInventoryAlerts: async () => {
    const [lowStock, reorderNeeded] = await Promise.all([
      QueryOptimizer.ingredients.getLowStockIngredients(),
      supabase
        .from('ingredients')
        .select('*')
        .filter('current_stock', 'lte', 'reorder_point')
        .eq('is_active', true)
    ]);

    return {
      lowStock: lowStock.data || [],
      reorderNeeded: reorderNeeded.data || []
    };
  },

  // Production planning (uses delivery date and recipe indexes)
  getProductionPlan: async (date: string) => {
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
  }
};

export default QueryOptimizer;
