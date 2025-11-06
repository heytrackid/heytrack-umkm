import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { NotificationPreferencesUpdateSchema } from '@/lib/validations/domains/notification-preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/domain/notification-preferences'
import { withSecurity, SecurityPresets } from '@/utils/security'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

async function getHandler(_request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('id, user_id, email_notifications, push_notifications, sms_notifications, created_at, updated_at')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create default
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            ...DEFAULT_NOTIFICATION_PREFERENCES,
          })
          .select()
          .single()

        if (insertError) {
          apiLogger.error({ error: insertError, userId: user.id }, 'Failed to create default preferences')
          return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 })
        }

        return NextResponse.json(newPrefs)
      }

      apiLogger.error({ error, userId: user.id }, 'Failed to fetch preferences')
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/notifications/preferences')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function putHandler(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = NotificationPreferencesUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Update preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, create new
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            ...validation.data,
          })
          .select()
          .single()

        if (insertError) {
          apiLogger.error({ error: insertError, userId: user.id }, 'Failed to create preferences')
          return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 })
        }

        apiLogger.info({ userId: user.id }, 'Notification preferences created')
        return NextResponse.json(newPrefs)
      }

      apiLogger.error({ error, userId: user.id }, 'Failed to update preferences')
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    apiLogger.info({ userId: user.id }, 'Notification preferences updated')
    return NextResponse.json(data)

   } catch (error: unknown) {
     apiLogger.error({ error }, 'Error in PUT /api/notifications/preferences')
     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
   }
}

export const GET = withSecurity(getHandler, SecurityPresets.enhanced())
export const PUT = withSecurity(putHandler, SecurityPresets.enhanced())
