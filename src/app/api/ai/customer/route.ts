import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customers,
      orders,
      period
    } = body

    // Validate required fields (at least one must be provided)
    if ((!customers || !Array.isArray(customers)) && (!orders || !Array.isArray(orders))) {
      return NextResponse.json(
        { error: 'Missing required fields: customers or orders (at least one must be array)' },
        { status: 400 }
      )
    }

    // Call AI service for customer analysis
    // Map customers to CustomerData format expected by the service
    const customerData = (customers || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      totalSpent: c.totalSpent || 0,
      orderCount: c.orderCount || c.totalOrders || 0,
      lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate) : new Date(),
      firstOrderDate: c.firstOrderDate || c.created_at ? new Date(c.firstOrderDate || c.created_at) : new Date(),
      favoriteProducts: c.favoriteProducts || [],
      orderFrequency: c.orderFrequency || 0
    }))
    
    const analysis = await aiService.customer.analyzeCustomers(customerData)

    if (!analysis) {
      return NextResponse.json(
        { error: 'AI service unavailable', fallback: true },
        { status: 503 }
      )
    }

    if (analysis.error) {
      return NextResponse.json(
        { error: 'AI analysis failed', details: analysis.error, fallback: true },
        { status: 500 }
      )
    }

    // Add metadata
    const result = {
      ...analysis,
      metadata: {
        analysisType: 'ai-powered-customer',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        confidence: analysis.insights?.length > 0 ? 'high' : 'medium'
      }
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('AI Customer API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 500 }
    )
  }
}