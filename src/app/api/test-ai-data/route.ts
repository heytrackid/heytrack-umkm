import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing AI Data Fetcher...');

    // Test basic data fetching
    const stats = await AIDataFetcher.getDashboardStats();
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch dashboard stats',
        message: 'AIDataFetcher returned null - check database connection'
      }, { status: 500 });
    }

    // Test individual fetchers
    const ingredients = await AIDataFetcher.getIngredientsData({ limit: 5 });
    const recipes = await AIDataFetcher.getRecipesData({ limit: 3 });
    const orders = await AIDataFetcher.getOrdersData({ limit: 5 });

    return NextResponse.json({
      success: true,
      message: '🎉 AI dapat mengakses data dari Supabase!',
      stats: {
        ...stats,
        // Sample data for verification
        sampleData: {
          ingredients: ingredients.slice(0, 2),
          recipes: recipes.slice(0, 1),
          orders: orders.slice(0, 2)
        }
      },
      summary: {
        ingredientsCount: ingredients.length,
        recipesCount: recipes.length,
        ordersCount: orders.length,
        dashboardStatsAvailable: !!stats
      }
    });
    
  } catch (error) {
    console.error('Error testing AI data fetcher:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to test AI data access',
      suggestion: 'Check Supabase connection and table permissions'
    }, { status: 500 });
  }
}