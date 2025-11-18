export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createListHandler } from '@/lib/api/crud-helpers'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import type { NextResponse } from 'next/server'

// GET /api/whatsapp-templates - List all templates
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/whatsapp-templates',
  },
  createListHandler({
    table: 'whatsapp_templates',
    selectFields: 'id, user_id, name, message, category, template_content, is_active, is_default, created_at, updated_at',
    defaultSort: 'created_at',
    defaultOrder: 'desc',
    searchFields: ['name', 'category'],
  })
)

// POST /api/whatsapp-templates - Create new template
const TemplateInsertSchema = z.object({
  name: z.string(),
  template_content: z.string(),
  category: z.string(),
  description: z.string().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
})

async function createTemplateHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof TemplateInsertSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return createErrorResponse('Request body is required', 400)
  }

  // If setting as default, unset other defaults in same category
  if (body.is_default) {
    await supabase
      .from('whatsapp_templates' as never)
      .update({ is_default: false } as never)
      .eq('user_id', user.id)
      .eq('category', body.category)
  }

  // Insert template
  const templateData = {
    name: body.name,
    description: body.description ?? '',
    category: body.category,
    template_content: body.template_content,
    variables: body.variables ?? [],
    is_active: body.is_active ?? true,
    is_default: body.is_default ?? false,
    user_id: user.id,
  }

  const { data, error } = await supabase
    .from('whatsapp_templates' as never)
    .insert(templateData as never)
    .select()
    .single()

  if (error) {
    apiLogger.error({ error, userId: user.id }, 'Failed to create WhatsApp template')
    return createErrorResponse('Failed to create template', 500)
  }

  apiLogger.info({ userId: user.id }, 'WhatsApp template created')
  return createSuccessResponse(data, 'Template created successfully')
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/whatsapp-templates',
    bodySchema: TemplateInsertSchema,
  },
  createTemplateHandler
)
