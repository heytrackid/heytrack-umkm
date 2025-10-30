import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

/**
 * Generate default WhatsApp templates for current user
 * POST /api/whatsapp-templates/generate-defaults
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if user already has templates
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

    // 3. Call function to create default templates
    const { error: createError } = await supabase.rpc('create_default_whatsapp_templates', {
      p_user_id: user.id,
    })

    if (createError) {
      apiLogger.error({ error: createError, userId: user.id }, 'Failed to create default templates')
      throw createError
    }

    // 4. Fetch created templates
    const { data: templates, error: fetchError } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch created templates')
      throw fetchError
    }

    apiLogger.info({ userId: user.id, count: templates?.length }, 'Default templates created')

    return NextResponse.json({
      message: 'Template default berhasil dibuat!',
      templates,
    })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/whatsapp-templates/generate-defaults')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
