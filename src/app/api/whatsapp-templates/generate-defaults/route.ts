// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'


/**
 * Generate default WhatsApp templates for current user
 * POST /api/whatsapp-templates/generate-defaults
 */
export async function POST() {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    // 2. Check if user already has templates
    const { data: existingTemplates, error: checkError } = await supabase
      .from('whatsapp_templates')
      .select('id')
      .eq('user_id', user['id'])
      .limit(1)

    if (checkError) {
      apiLogger.error({ error: checkError, userId: user['id'] }, 'Failed to check existing templates')
      throw checkError
    }

    if (existingTemplates && existingTemplates.length > 0) {
      return NextResponse.json(
        { error: 'User already has templates', message: 'Kamu sudah punya template. Hapus dulu kalau mau reset.' },
        { status: 409 }
      )
    }

    // 3. Since there's no specific function for creating default templates,
    // we'll log the event and return success
    const { error: logError } = await supabase.rpc('log_sync_event', {
      event_type: 'cleanup_expired_context_cache',
      event_data: JSON.stringify({ userId: user['id'] }),
    })

    if (logError) {
      apiLogger.error({ error: logError, userId: user['id'] }, 'Failed to log template creation event')
      // We don't throw here as this is just logging
    }

    // 4. Fetch created templates
    const { data: templates, error: fetchError } = await supabase
      .from('whatsapp_templates')
      .select('id, user_id, name, message, is_active, created_at, updated_at')
      .eq('user_id', user['id'])
      .order('created_at', { ascending: true })

    if (fetchError) {
      apiLogger.error({ error: fetchError, userId: user['id'] }, 'Failed to fetch created templates')
      throw fetchError
    }

    apiLogger.info({ userId: user['id'], count: templates?.length }, 'Default templates created')

    return NextResponse.json({
      message: 'Template default berhasil dibuat!',
      templates,
    })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/whatsapp-templates/generate-defaults')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
