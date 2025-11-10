// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

 import { apiLogger } from '@/lib/logger'
 import { withSecurity, SecurityPresets } from '@/utils/security/index'
 import { createClient } from '@/utils/supabase/server'


async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    const _body = await request.json() as { category?: string }
    const { category } = _body

    // Build query
    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user['id'])
      .eq('is_read', false)

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    const { error } = await query

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to mark all notifications as read')
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
    }

    apiLogger.info({ userId: user['id'], category }, 'Marked all notifications as read')

    return NextResponse.json({ message: 'All notifications marked as read' })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/notifications/mark-all-read')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withSecurity(postHandler, SecurityPresets.enhanced())
