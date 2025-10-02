import { NextResponse } from 'next/server';
import { AIDataFetcher } from '@/lib/ai/data-fetcher';

/**
 * Test endpoint untuk cek AI + Supabase integration
 * GET /api/ai/test-data
 */
export async function GET() {
  try {
    console.log('🔍 Fetching data from Supabase...');
    
    // Ambil dashboard stats dari database
    const stats = await AIDataFetcher.getDashboardStats();
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data from Supabase'
      }, { status: 500 });
    }
    
    // Format untuk display
    const summary = {
      ingredients: {
        total: stats.ingredients.total,
        lowStock: stats.ingredients.lowStock,
        outOfStock: stats.ingredients.outOfStock,
        sample: stats.ingredients.data.slice(0, 3).map((i: any) => ({
          name: i.name,
          stock: i.current_stock,
          unit: i.unit
        }))
      },
      recipes: {
        total: stats.recipes.total,
        sample: stats.recipes.data.slice(0, 3).map((r: any) => ({
          name: r.name,
          category: r.category
        }))
      },
      orders: {
        total: stats.orders.total,
        completed: stats.orders.completed,
        pending: stats.orders.pending,
        revenue: stats.orders.totalRevenue
      },
      customers: {
        total: stats.customers.total,
        active: stats.customers.active
      },
      financial: {
        income: stats.financial.totalIncome,
        expense: stats.financial.totalExpense,
        netProfit: stats.financial.totalIncome - stats.financial.totalExpense
      }
    };
    
    return NextResponse.json({
      success: true,
      message: '✅ AI berhasil mengakses data dari Supabase!',
      timestamp: new Date().toISOString(),
      dataSource: 'Supabase (Last 30 days)',
      summary
    });
    
  } catch (error: any) {
    console.error('Error in test-data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
