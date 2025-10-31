import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // ✅ Add authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Log web vitals metrics with user context
    apiLogger.info({
      userId: user.id,
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
