import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log web vitals metrics
    apiLogger.info({
      metric: body.name,
      value: body.value,
      rating: body.rating,
      id: body.id
    }, 'Web Vitals metric recorded')

    // In production, you might want to send this to analytics service
    // like Google Analytics, Vercel Analytics, or custom analytics

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Failed to record web vitals')
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 })
  }
}
