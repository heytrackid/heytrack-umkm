// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { apiLogger } from '@/lib/logger'
import { createSuccessResponse } from '@/lib/api-core/responses'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import type { NextResponse } from 'next/server'

/**
 * Generate default WhatsApp templates for current user
 * POST /api/whatsapp-templates/generate-defaults
 */
async function postHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
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
      return handleAPIError(new Error('Kamu sudah punya template. Hapus dulu kalau mau reset.'), 'API Route')
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
      .select('id, user_id, name, category, template_content, description, variables, is_active, is_default, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch created templates')
      throw fetchError
    }

    apiLogger.info({ userId: user.id, count: templates?.length }, 'Default templates created successfully')

    return createSuccessResponse({ templates }, SUCCESS_MESSAGES.WHATSAPP_DEFAULTS_GENERATED)
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/whatsapp-templates/generate-defaults')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

export const POST = createApiRoute(
  { method: 'POST', path: '/api/whatsapp-templates/generate-defaults' },
  postHandler
)
