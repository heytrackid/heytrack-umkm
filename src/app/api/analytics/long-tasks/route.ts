import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log long tasks for performance monitoring
    apiLogger.warn({
      duration: body.duration,
      startTime: body.startTime,
      name: body.name
    }, 'Long task detected')

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Failed to record long task')
    return NextResponse.json({ error: 'Failed to record task' }, { status: 500 })
  }
}
