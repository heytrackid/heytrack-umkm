import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function GET() {
  try {
    const isHealthy = await aiService.healthCheck()
    
    if (isHealthy) {
      return NextResponse.json({
        status: 'healthy',
        message: 'AI service is operational',
        model: 'grok-4-fast-free',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        message: 'AI service is not available',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}