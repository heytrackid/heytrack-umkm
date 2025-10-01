/**
 * AI Data Fetcher
 * Helper untuk mengambil data dari Supabase untuk AI analysis
 * Uses service role to bypass RLS for AI analysis
 */

import { createClient } from '@supabase/supabase-js';

// Create admin client for AI operations (bypasses RLS)
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials for AI Data Fetcher');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

const supabase = getAdminClient();

export class AIDataFetcher {
  /**
   * Ambil data ingredients untuk AI pricing/inventory analysis
   */
  static async getIngredientsData(filters?: {
    category?: string;
    lowStock?: boolean;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.lowStock) {
        query = query.lt('current_stock', supabase.raw('min_stock'));
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ingredients:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getIngredientsData:', error);
      return [];
    }
  }

  /**
   * Ambil data recipes untuk AI production analysis
   */
  static async getRecipesData(filters?: {
    category?: string;
    limit?: number;
  }) {
    try {
      // Simplified query without nested relationships to avoid RLS conflicts
      let query = supabase
        .from('recipes')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recipes:', error);
        return [];
      }

      // If we got recipes, fetch their ingredients separately
      if (data && data.length > 0) {
        const recipeIds = data.map((r: any) => r.id);
        
        const { data: ingredients, error: ingError } = await supabase
          .from('recipe_ingredients')
          .select(`
            *,
            ingredients (
              name,
              unit,
              unit_price,
              current_stock
            )
          `)
          .in('recipe_id', recipeIds);

        if (!ingError && ingredients) {
          // Attach ingredients to their recipes
          const enrichedRecipes = data.map((recipe: any) => ({
            ...recipe,
            recipe_ingredients: ingredients.filter((ing: any) => ing.recipe_id === recipe.id)
          }));
          return enrichedRecipes;
        }
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecipesData:', error);
      return [];
    }
  }

  /**
   * Ambil data orders untuk AI customer/sales analysis
   */
  static async getOrdersData(filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            unit_price,
            total_price
          ),
          customers (
            name,
            email,
            phone
          )
        `)
        .order('order_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('order_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('order_date', filters.dateTo);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrdersData:', error);
      return [];
    }
  }

  /**
   * Ambil data customers untuk AI customer analysis
   */
  static async getCustomersData(filters?: {
    active?: boolean;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          orders (
            id,
            order_date,
            total_amount,
            status
          )
        `)
        .order('name', { ascending: true });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        return [];
      }

      // Calculate customer metrics
      return (data || []).map((customer: any) => ({
        ...customer,
        totalOrders: customer.orders?.length || 0,
        totalSpent: customer.orders?.reduce((sum: number, order: any) => 
          sum + (order.total_amount || 0), 0) || 0,
        lastOrderDate: customer.orders?.[0]?.order_date || null,
      }));
    } catch (error) {
      console.error('Error in getCustomersData:', error);
      return [];
    }
  }

  /**
   * Ambil data financial untuk AI financial analysis
   */
  static async getFinancialData(filters?: {
    type?: 'income' | 'expense';
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('financial_records')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.dateFrom) {
        query = query.gte('transaction_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('transaction_date', filters.dateTo);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching financial records:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFinancialData:', error);
      return [];
    }
  }

  /**
   * Ambil operational costs untuk AI cost analysis
   */
  static async getOperationalCostsData(filters?: {
    category?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('operational_costs')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching operational costs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOperationalCostsData:', error);
      return [];
    }
  }

  /**
   * Ambil dashboard stats untuk AI insights
   */
  static async getDashboardStats() {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const [
        ingredients,
        recipes,
        orders,
        customers,
        financialRecords
      ] = await Promise.all([
        this.getIngredientsData({ limit: 100 }),
        this.getRecipesData({ limit: 50 }),
        this.getOrdersData({ 
          dateFrom: thirtyDaysAgo.toISOString(),
          limit: 100 
        }),
        this.getCustomersData({ limit: 100 }),
        this.getFinancialData({ 
          dateFrom: thirtyDaysAgo.toISOString(),
          limit: 100 
        })
      ]);

      return {
        ingredients: {
          total: ingredients.length,
          lowStock: ingredients.filter((i: any) => i.current_stock < i.min_stock).length,
          outOfStock: ingredients.filter((i: any) => i.current_stock === 0).length,
          data: ingredients
        },
        recipes: {
          total: recipes.length,
          data: recipes
        },
        orders: {
          total: orders.length,
          completed: orders.filter((o: any) => o.status === 'completed').length,
          pending: orders.filter((o: any) => o.status === 'pending').length,
          totalRevenue: orders
            .filter((o: any) => o.status === 'completed')
            .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
          data: orders
        },
        customers: {
          total: customers.length,
          active: customers.filter((c: any) => c.totalOrders > 0).length,
          data: customers
        },
        financial: {
          totalIncome: financialRecords
            .filter((f: any) => f.type === 'income')
            .reduce((sum: number, f: any) => sum + (f.amount || 0), 0),
          totalExpense: financialRecords
            .filter((f: any) => f.type === 'expense')
            .reduce((sum: number, f: any) => sum + (f.amount || 0), 0),
          data: financialRecords
        }
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return null;
    }
  }

  /**
   * Format data untuk AI context
   */
  static formatForAI(data: any, type: 'ingredients' | 'recipes' | 'orders' | 'customers' | 'financial') {
    if (!data || data.length === 0) return 'No data available';

    switch (type) {
      case 'ingredients':
        return data.map((item: any) => 
          `${item.name}: Stok ${item.current_stock} ${item.unit}, Harga ${item.unit_price}/unit`
        ).join('\n');

      case 'recipes':
        return data.map((item: any) => 
          `${item.name} (${item.category}): ${item.recipe_ingredients?.length || 0} bahan`
        ).join('\n');

      case 'orders':
        return data.map((item: any) => 
          `Order #${item.order_number}: ${item.status}, Total Rp ${item.total_amount}`
        ).join('\n');

      case 'customers':
        return data.map((item: any) => 
          `${item.name}: ${item.totalOrders} orders, Total spent Rp ${item.totalSpent}`
        ).join('\n');

      case 'financial':
        return data.map((item: any) => 
          `${item.transaction_date}: ${item.type} - Rp ${item.amount} (${item.description})`
        ).join('\n');

      default:
        return JSON.stringify(data, null, 2);
    }
  }
}

export default AIDataFetcher;
