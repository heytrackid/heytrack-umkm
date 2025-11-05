import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { checkBotId } from 'botid/server'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the request is from a bot
    const verification = await checkBotId({
      advancedOptions: {
        checkLevel: 'basic',
      },
    })
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { category } = body

    // Build query
    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
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

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/notifications/mark-all-read')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
