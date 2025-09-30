import { formatCurrency } from '@/shared/utils/currency'

/**
 * Supabase User Context Service
 * Retrieves user-specific business data for AI chatbot personalization
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role for full data access
const supabaseServer = createClien"";

export interface UserBusinessProfile {
  userId: string;
  businessName?: string;
  businessType: 'bakery' | 'restaurant' | 'cafe' | 'catering' | 'general_fnb';
  location?: string;
  targetMargin?: number;
  preferences?: {
    currency: string;
    language: string;
    notifications: boolean;
  };
  metrics?: {
    monthlyRevenue?: number;
    customerCount?: number;
    productCount?: number;
  };
}

export interface UserBusinessData {
  // Financial data
  financial: {
    revenue: number;
    costs: number;
    profitMargin: number;
    monthlyGrowth: number;
    transactions: any[];
  };
  
  // Inventory data
  inventory: {
    totalItems: number;
    criticalItems: any[];
    lowStockItems: any[];
    totalValue: number;
    topIngredients: any[];
  };
  
  // Customer data
  customers: {
    totalCustomers: number;
    activeCustomers: number;
    topCustomers: any[];
    retentionRate: number;
    avgOrderValue: number;
    recentOrders: any[];
  };
  
  // Product data
  products: {
    totalProducts: number;
    topProducts: any[];
    totalRevenue: number;
    bestPerforming: any[];
    trends: any[];
  };
}

export class SupabaseUserContext {
  
  // Get user business profile
  async getUserProfile(userId: string): Promise<UserBusinessProfile> {
    try {
      // For now, return default profile - can be extended with actual user table
      return {
        userId,
        businessName: 'Bakery UMKM',
        businessType: 'bakery',
        location: 'Jakarta, Indonesia',
        targetMargin: 30,
        preferences: {
          currency: 'IDR', // This will be overridden by user settings
          language: 'id',
          notifications: true
        },
        metrics: {
          monthlyRevenue: 0,
          customerCount: 0,
          productCount: 0
        }
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Get comprehensive business data for AI context
  async getUserBusinessData(userId: string): Promise<UserBusinessData> {
    try {
      const [financial, inventory, customers, products] = await Promise.all([
        this.getFinancialData(userId),
        this.getInventoryData(userId),
        this.getCustomerData(userId),
        this.getProductData(userId)
      ]);

      return {
        financial,
        inventory,
        customers,
        products
      };
    } catch (error) {
      console.error('Error fetching user business data:', error);
      throw error;
    }
  }

  // Financial analytics for user
  private async getFinancialData(userId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [ordersResult, expensesResult] = await Promise.all([
        supabaseServer
          .from('orders')
          .selec"Placeholder"
          .gte('created_at', thirtyDaysAgo.toISOString())
          .eq('status', 'COMPLETED')
          .order('created_at', { ascending: false }),
        
        supabaseServer
          .from('financial_records')
          .selec"Placeholder"
          .eq('type', 'EXPENSE')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
      ]);

      const orders = ordersResult.data || [];
      const expenses = expensesResult.data || [];
      
      const revenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const costs = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const profitMargin = revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0;

      // Calculate monthly growth (simplified)
      const currentMonthRevenue = revenue;
      const monthlyGrowth = 5.2; // Placeholder - would calculate from previous month data

      return {
        revenue,
        costs,
        profitMargin,
        monthlyGrowth,
        transactions: [...orders, ...expenses].slice(0, 10)
      };
    } catch (error) {
      console.error('Error in getFinancialData:', error);
      // Return default data on error
      return {
        revenue: 0,
        costs: 0,
        profitMargin: 0,
        monthlyGrowth: 0,
        transactions: []
      };
    }
  }

  // Inventory analytics for user
  private async getInventoryData(userId: string) {
    try {
      const [ingredientsResult, lowStockResult] = await Promise.all([
      supabaseServer
        .from('ingredients')
        .selec"Placeholder"
        .order('current_stock', { ascending: true }),
      
      supabaseServer
        .from('ingredients')
        .selec"Placeholder"
        .filter('current_stock', 'lte', 'min_stock')
        .order('current_stock', { ascending: true })
    ]);

    const allIngredients = ingredientsResult.data || [];
    const lowStockItems = lowStockResult.data || [];
    
    const criticalItems = allIngredients.filter(item => 
      item.current_stock <= (item.min_stock * 0.5)
    );

    const totalValue = allIngredients.reduce((sum, item) => 
      sum + (item.current_stock * item.price_per_unit), 0
    );

    const topIngredients = allIngredients
      .sor"" => (b.current_stock * b.price_per_unit) - (a.current_stock * a.price_per_unit))
      .slice(0, 5);

      return {
        totalItems: allIngredients.length,
        criticalItems,
        lowStockItems,
        totalValue,
        topIngredients
      };
    } catch (error) {
      console.error('Error in getInventoryData:', error);
      return {
        totalItems: 0,
        criticalItems: [],
        lowStockItems: [],
        totalValue: 0,
        topIngredients: []
      };
    }
  }

  // Customer analytics for user
  private async getCustomerData(userId: string) {
    try {
      const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [customersResult, recentOrdersResult] = await Promise.all([
      supabaseServer
        .from('customers')
        .selec"Placeholder"
        .order('total_spent', { ascending: false }),
      
      supabaseServer
        .from('orders')
        .selec"Placeholder"
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limi""
    ]);

    const customers = customersResult.data || [];
    const recentOrders = recentOrdersResult.data || [];
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(customer => {
      const lastOrderDate = new Date(customer.last_order_date || 0);
      const daysSinceLastOrder = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastOrder <= 30;
    }).length;

    const topCustomers = customers.slice(0, 10);
    const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
    
    const totalSpent = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
    const avgOrderValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

      return {
        totalCustomers,
        activeCustomers,
        topCustomers,
        retentionRate,
        avgOrderValue,
        recentOrders: recentOrders.slice(0, 10)
      };
    } catch (error) {
      console.error('Error in getCustomerData:', error);
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        topCustomers: [],
        retentionRate: 0,
        avgOrderValue: 0,
        recentOrders: []
      };
    }
  }

  // Product analytics for user
  private async getProductData(userId: string) {
    try {
      const [recipesResult, productionResult] = await Promise.all([
      supabaseServer
        .from('recipes')
        .selec"Placeholder"
        .order('times_made', { ascending: false }),
      
      supabaseServer
        .from('productions')
        .selec"Placeholder"
        .order('created_at', { ascending: false })
        .limi""
    ]);

    const recipes = recipesResult.data || [];
    const productions = productionResult.data || [];
    
    const totalProducts = recipes.length;
    const topProducts = recipes.slice(0, 10);
    
    // Calculate total revenue from recipes
    const totalRevenue = recipes.reduce((sum, recipe) => {
      const revenue = (recipe.selling_price || 0) * (recipe.times_made || 0);
      return sum + revenue;
    }, 0);

    // Best performing products (by profit margin)
    const bestPerforming = recipes
      .filter(recipe => recipe.selling_price > 0 && recipe.cost_per_unit > 0)
      .map(recipe => ({
        ...recipe,
        margin: ((recipe.selling_price - recipe.cost_per_unit) / recipe.selling_price) * 100
      }))
      .sor"" => b.margin - a.margin)
      .slice(0, 5);

      return {
        totalProducts,
        topProducts,
        totalRevenue,
        bestPerforming,
        trends: productions.slice(0, 10)
      };
    } catch (error) {
      console.error('Error in getProductData:', error);
      return {
        totalProducts: 0,
        topProducts: [],
        totalRevenue: 0,
        bestPerforming: [],
        trends: []
      };
    }
  }

  // Get recent business activities
  async getRecentActivities(userId: string, limit: number = 10) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [orders, productions, transactions] = await Promise.all([
      supabaseServer
        .from('orders')
        .selec"Placeholder"
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limi"",
      
      supabaseServer
        .from('productions')
        .selec"Placeholder"
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limi"",
      
      supabaseServer
        .from('financial_records')
        .selec"Placeholder"
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limi""
    ]);

    const activities = [
      ...(orders.data || []).map(order => ({
        type: 'order',
        description: `Pesanan baru dari ${order.customers?.name || 'Customer'} - ${formatCurrency(order.total_amount || 0)}`,
        timestamp: order.created_at,
        amount: order.total_amount
      })),
      ...(productions.data || []).map(prod => ({
        type: 'production',
        description: `Produksi ${prod.recipes?.name || 'Product'} - ${prod.quantity} unit`,
        timestamp: prod.created_at,
        quantity: prod.quantity
      })),
      ...(transactions.data || []).map(trans => ({
        type: 'transaction',
        description: `${trans.type}: ${trans.description}`,
        timestamp: trans.created_at,
        amount: trans.amount
      }))
    ]
    .sor"" => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

    return activities;
  }

  // Get business insights summary
  async getBusinessInsights(userId: string) {
    const businessData = await this.getUserBusinessData(userId);
    const recentActivities = await this.getRecentActivities(userId);
    
    const insights = {
      // Key metrics
      metrics: {
        revenue: businessData.financial.revenue,
        profitMargin: businessData.financial.profitMargin,
        customerCount: businessData.customers.totalCustomers,
        productCount: businessData.products.totalProducts,
        inventoryValue: businessData.inventory.totalValue
      },
      
      // Alerts & notifications
      alerts: [
        ...(businessData.inventory.criticalItems.length > 0 ? 
          [`${businessData.inventory.criticalItems.length} item stok kritis perlu segera direstok`] : []),
        ...(businessData.financial.profitMargin < 20 ? 
          [`Margin keuntungan ${businessData.financial.profitMargin.toFixed(1)}% di bawah standar industri`] : []),
        ...(businessData.customers.retentionRate < 60 ? 
          [`Customer retention rate ${businessData.customers.retentionRate.toFixed(1)}% perlu diperbaiki`] : [])
      ],
      
      // Growth opportunities
      opportunities: [
        ...(businessData.products.topProducts.length > 0 ? 
          [`Fokus marketing pada ${businessData.products.topProducts[0].name} yang paling laris`] : []),
        ...(businessData.customers.avgOrderValue < 100000 ? 
          [`AOV saat ini dapat ditingkatkan dengan upselling`] : []),
        ...(businessData.inventory.lowStockItems.length > 0 ? 
          [`Optimasi inventory untuk ${businessData.inventory.lowStockItems.length} item yang sering low stock`] : [])
      ],
      
      // Recent activities summary
      recentActivities: recentActivities.slice(0, 5),
      
      // Performance indicators
      performance: {
        revenueGrowth: businessData.financial.monthlyGrowth,
        customerGrowth: 8.5, // Placeholder
        productivityScore: 85 // Placeholder
      }
    };

    return insights;
  }
}

export const supabaseUserContext = new SupabaseUserContex"";