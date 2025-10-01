import { NextResponse } from 'next/server';
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { aiService } from '@/lib/ai';

export async function GET() {
  try {
    console.log('Fetching dashboard stats from database...');
    
    // Fetch comprehensive stats from database
    const stats = await AIDataFetcher.getDashboardStats();
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch dashboard stats',
        message: 'Unable to retrieve data from database'
      }, { status: 500 });
    }

    console.log('Stats retrieved successfully:', {
      ingredients: stats.ingredients.total,
      recipes: stats.recipes.total,
      orders: stats.orders.total,
      customers: stats.customers.total
    });

    // Prepare data for AI comprehensive analysis
    const recipes = stats.recipes.data.slice(0, 10);
    const ingredients = stats.ingredients.data.slice(0, 20);

    // Build pricing analysis data
    let pricingAnalysisData = null;
    if (recipes.length > 0 && stats.orders.totalRevenue > 0) {
      pricingAnalysisData = {
        recipes: recipes.map((r: any) => ({
          name: r.name,
          sellingPrice: r.selling_price || 0,
          category: r.category
        })),
        avgOrderValue: stats.orders.total > 0 ? stats.orders.totalRevenue / stats.orders.total : 0,
        totalRevenue: stats.orders.totalRevenue
      };
    }

    // Build production analysis data
    let productionAnalysisData = null;
    if (recipes.length > 0 && ingredients.length > 0) {
      productionAnalysisData = {
        recipes: recipes.map((r: any) => ({
          name: r.name,
          ingredientCount: r.recipe_ingredients?.length || 0
        })),
        ingredients: ingredients.map((i: any) => ({
          name: i.name,
          currentStock: i.current_stock,
          minStock: i.min_stock
        })),
        completionRate: stats.orders.total > 0 ? stats.orders.completed / stats.orders.total : 0
      };
    }

    // Build customer analysis data
    let customerAnalysisData = null;
    if (stats.customers.data.length > 0) {
      customerAnalysisData = {
        customers: stats.customers.data.slice(0, 20).map((c: any) => ({
          name: c.name,
          totalOrders: c.totalOrders || 0,
          totalSpent: c.totalSpent || 0
        })),
        activeRate: stats.customers.total > 0 ? stats.customers.active / stats.customers.total : 0
      };
    }

    console.log('Calling AI service for business insights...');

    // Call AI service for comprehensive business insights
    const insights = await aiService.getBusinessInsights({
      pricing: pricingAnalysisData,
      production: productionAnalysisData,
      customers: customerAnalysisData
    });

    console.log('AI insights generated successfully');

    // Build response
    return NextResponse.json({
      success: true,
      dataSource: 'database',
      stats: {
        ingredients: {
          total: stats.ingredients.total,
          lowStock: stats.ingredients.lowStock,
          outOfStock: stats.ingredients.outOfStock
        },
        recipes: {
          total: stats.recipes.total
        },
        orders: {
          total: stats.orders.total,
          completed: stats.orders.completed,
          pending: stats.orders.pending,
          totalRevenue: stats.orders.totalRevenue,
          avgOrderValue: stats.orders.total > 0 ? stats.orders.totalRevenue / stats.orders.total : 0
        },
        customers: {
          total: stats.customers.total,
          active: stats.customers.active,
          activeRate: stats.customers.total > 0 ? (stats.customers.active / stats.customers.total * 100).toFixed(1) + '%' : '0%'
        },
        financial: {
          totalIncome: stats.financial.totalIncome,
          totalExpense: stats.financial.totalExpense,
          netProfit: stats.financial.totalIncome - stats.financial.totalExpense,
          profitMargin: stats.financial.totalIncome > 0 
            ? ((stats.financial.totalIncome - stats.financial.totalExpense) / stats.financial.totalIncome * 100).toFixed(1) + '%'
            : '0%'
        }
      },
      insights: {
        summary: insights.summary || 'Business analysis completed',
        priorityActions: insights.priorityActions || [],
        pricing: insights.pricing || null,
        production: insights.production || null,
        customers: insights.customers || null
      },
      metadata: {
        analysisType: 'comprehensive-business-intelligence',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        dataSource: 'database',
        period: 'last-30-days'
      }
    });

  } catch (error) {
    console.error('AI Dashboard Insights API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate dashboard insights',
      suggestion: 'Check AI service configuration and database connection',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
