// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

 import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import type { NotificationsTable } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
 


async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const _body = await request.json() as { category?: string }
    const { category } = _body

    // Build query
    const updateData: Partial<Pick<NotificationsTable, 'is_read' | 'updated_at'>> = {
      is_read: true,
      updated_at: new Date().toISOString(),
    }

    let query = supabase
      .from('notifications')
      .update(updateData as never)
      .eq('is_read', false)

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    const { error } = await query

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to mark all notifications as read')
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
    }

    apiLogger.info({ userId: user.id, category }, 'Marked all notifications as read')

    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/notifications/mark-all-read')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withSecurity(postHandler, SecurityPresets.enhanced())
