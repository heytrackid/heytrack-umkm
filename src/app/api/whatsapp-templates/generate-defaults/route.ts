// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

/**
 * Generate default WhatsApp templates for current user
 * POST /api/whatsapp-templates/generate-defaults
 */
async function postHandler(): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()    // 2. Check if user already has templates
    const { data: existingTemplates, error: checkError } = await supabase
      .from('whatsapp_templates')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (checkError) {
      apiLogger.error({ error: checkError, userId: user.id }, 'Failed to check existing templates')
      throw checkError
    }

    if (existingTemplates && existingTemplates.length > 0) {
      return NextResponse.json(
        { error: 'User already has templates', message: 'Kamu sudah punya template. Hapus dulu kalau mau reset.' },
        { status: 409 }
      )
    }

    // 3. Create default templates using database function
    const { error: createError } = await supabase.rpc('create_default_whatsapp_templates', {
      p_user_id: user.id
    })

    if (createError) {
      apiLogger.error({ error: createError, userId: user.id }, 'Failed to create default templates')
      throw createError
    }

    // 4. Fetch created templates
    const { data: templates, error: fetchError } = await supabase
      .from('whatsapp_templates')
      .select('id, user_id, name, message, is_active, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch created templates')
      throw fetchError
    }

    apiLogger.info({ userId: user.id, count: templates?.length }, 'Default templates created successfully')

    return NextResponse.json({
      success: true,
      message: 'Template default berhasil dibuat!',
      templates,
    })
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/whatsapp-templates/generate-defaults')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/whatsapp-templates/generate-defaults', SecurityPresets.enhanced())
