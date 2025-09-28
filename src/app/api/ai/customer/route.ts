import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

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
    const analysis = await aiService.analyzeCustomer({
      customers: customers || [],
      orders: orders || [],
      period: period || '30d'
    })

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

  } catch (error) {
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