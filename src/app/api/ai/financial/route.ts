import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      records,
      period,
      businessType
    } = body

    // Validate required fields
    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Missing required field: records (must be array)' },
        { status: 400 }
      )
    }

    // Call AI service for financial analysis
    const analysis = await aiService.analyzeFinancial({
      records,
      period: period || '30d',
      businessType: businessType || 'bakery'
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
        analysisType: 'ai-powered-financial',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        confidence: analysis.insights?.length > 0 ? 'high' : 'medium'
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('AI Financial API error:', error)
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