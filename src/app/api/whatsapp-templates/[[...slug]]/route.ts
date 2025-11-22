// External libraries
import { z } from 'zod'
import type { NextResponse } from 'next/server'

// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { createListHandler, createGetHandler, createUpdateHandler, createDeleteHandler, ListQuerySchema } from '@/lib/api/crud-helpers'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

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

const TemplateUpdateSchema = z.object({
  name: z.string().optional(),
  template_content: z.string().optional(),
  category: z.string().optional(),
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
  },
  async (context, validatedQuery) => {
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
    bodySchema: TemplateInsertSchema,
  },
  createTemplateHandler
)

// PUT /api/whatsapp-templates/[id] - Update template
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/whatsapp-templates/[id]',
    bodySchema: TemplateUpdateSchema,
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
      'Template updated successfully'
    )(context, undefined, body)
  }
)

// DELETE /api/whatsapp-templates/[id] - Delete template
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/whatsapp-templates/[id]',
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
      'Template deleted successfully'
    )(context)
  }
)