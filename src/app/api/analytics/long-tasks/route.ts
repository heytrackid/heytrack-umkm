 import { type NextRequest, NextResponse } from 'next/server'
 import { createClient } from '@/utils/supabase/server'
 import { apiLogger } from '@/lib/logger'
 import { withSecurity, SecurityPresets } from '@/utils/security'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

async function longTasksPOST(request: NextRequest) {
  try {
    // ✅ Add authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Log long tasks for performance monitoring with user context
    apiLogger.warn({
      userId: user.id,
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

export const POST = withSecurity(longTasksPOST, SecurityPresets.enhanced())
