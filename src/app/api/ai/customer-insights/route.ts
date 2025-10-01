import { NextResponse } from 'next/server';
import { AIDataFetcher } from '@/lib/ai/data-fetcher';
import { aiService } from '@/lib/ai';

export async function GET() {
  try {
    // Fetch customers data with order history from database
    const customers = await AIDataFetcher.getCustomersData({ limit: 100 });

    // Ensure customers is an array
    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No customers found in database',
        message: 'Please add customers first before using AI customer insights'
      }, { status: 404 });
    }

    // Prepare customer data for AI analysis
    const customerData = customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      totalSpent: c.totalSpent || 0,
      orderCount: c.totalOrders || 0,
      lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate) : new Date(),
      firstOrderDate: c.created_at ? new Date(c.created_at) : new Date(),
      favoriteProducts: [], // Could be calculated from order history
      orderFrequency: c.totalOrders || 0 // Simplified: actual implementation would calculate per month
    }));

    // Call AI service for customer analysis (expects array, not object)
    const insights = await aiService.customer.analyzeCustomers(customerData);

    if (!insights) {
      return NextResponse.json({
        success: false,
        error: 'AI service unavailable',
        fallback: true
      }, { status: 503 });
    }

    // Calculate additional metrics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c: any) => c.totalOrders > 0).length;
    const totalRevenue = customers.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0);
    const avgOrderValue = totalRevenue / customers.reduce((sum: number, c: any) => sum + (c.totalOrders || 0), 0);

    return NextResponse.json({
      success: true,
      dataSource: 'database',
      insights,
      summary: {
        totalCustomers,
        activeCustomers,
        activeRate: (activeCustomers / totalCustomers * 100).toFixed(1) + '%',
        totalRevenue,
        avgOrderValue: avgOrderValue || 0,
        avgOrdersPerCustomer: (customers.reduce((sum: number, c: any) => sum + (c.totalOrders || 0), 0) / totalCustomers).toFixed(1)
      },
      metadata: {
        analysisType: 'ai-powered-customer-insights',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        dataSource: 'database'
      }
    });

  } catch (error) {
    console.error('AI Customer Insights API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate customer insights',
      suggestion: 'Check AI service configuration and database connection'
    }, { status: 500 });
  }
}
