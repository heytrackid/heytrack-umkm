// External libraries
import type { NextResponse } from 'next/server'
import { z } from 'zod'

// Internal modules - Core
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createDeleteHandler, createGetHandler, createListHandler, createUpdateHandler, ListQuerySchema, type ListQuery } from '@/lib/api/crud-helpers'

// Internal modules - Utils
import { parseRouteParams } from '@/lib/api/route-helpers'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
export const runtime = 'nodejs'

const TemplateInsertSchema = z.object({
  name: z.string(),
  template_content: z.string(),
  category: z.string(),
  description: z.string().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
})



// GET /api/whatsapp-templates or /api/whatsapp-templates/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/whatsapp-templates',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery?: ListQuery) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/whatsapp-templates - List all templates
      return createListHandler({
        table: 'whatsapp_templates',
        selectFields: 'id, user_id, name, category, template_content, description, variables, is_active, is_default, created_at, updated_at',
        defaultSort: 'created_at',
        defaultOrder: 'desc',
        searchFields: ['name', 'category'],
      })(context, validatedQuery)
    } else if (slug && slug.length === 1) {
      // GET /api/whatsapp-templates/[id] - Get single template
      return createGetHandler({
        table: 'whatsapp_templates',
        selectFields: 'id, user_id, name, category, template_content, description, variables, is_active, is_default, created_at, updated_at',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/whatsapp-templates - Create new template
async function createTemplateHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof TemplateInsertSchema>
): Promise<NextResponse> {
  const slug = context.params?.['slug'] as string[] | undefined
  if (slug && slug.length > 0) {
    return handleAPIError(new Error('Method not allowed'), 'API Route')
  }

  const { user, supabase } = context

  if (!body) {
    return handleAPIError(new Error('Request body is required'), 'API Route')
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
    return handleAPIError(new Error('Failed to create template'), 'API Route')
  }

  apiLogger.info({ userId: user.id }, 'WhatsApp template created')
  return createSuccessResponse(data, SUCCESS_MESSAGES.WHATSAPP_TEMPLATE_CREATED)
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/whatsapp-templates',
    securityPreset: SecurityPresets.basic(),
  },
  createTemplateHandler
)

// PUT /api/whatsapp-templates/[id] - Update template
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/whatsapp-templates/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createUpdateHandler(
      {
        table: 'whatsapp_templates',
        selectFields: 'id, user_id, name, category, template_content, description, variables, is_active, is_default, updated_at',
      },
      SUCCESS_MESSAGES.WHATSAPP_TEMPLATE_UPDATED
    )(context, undefined, body)
  }
)

// DELETE /api/whatsapp-templates/[id] - Delete template
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/whatsapp-templates/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createDeleteHandler(
      {
        table: 'whatsapp_templates',
      },
      SUCCESS_MESSAGES.WHATSAPP_TEMPLATE_DELETED
    )(context)
  }
)