export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'

const TemplateUpdateSchema = z.object({
  name: z.string().optional(),
  template_content: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
})

// GET /api/whatsapp-templates/[id] - Get single template
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/whatsapp-templates/[id]',
  },
  createGetHandler({
    table: 'whatsapp_templates',
    selectFields: 'id, user_id, name, category, template_content, description, variables, is_active, is_default, created_at, updated_at',
  })
)

// PUT /api/whatsapp-templates/[id] - Update template
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/whatsapp-templates/[id]',
    bodySchema: TemplateUpdateSchema,
  },
  createUpdateHandler(
    {
      table: 'whatsapp_templates',
      selectFields: 'id, user_id, name, category, template_content, description, variables, is_active, is_default, updated_at',
    },
    'Template updated successfully'
  )
)

// DELETE /api/whatsapp-templates/[id] - Delete template
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/whatsapp-templates/[id]',
  },
  createDeleteHandler(
    {
      table: 'whatsapp_templates',
    },
    'Template deleted successfully'
  )
)
