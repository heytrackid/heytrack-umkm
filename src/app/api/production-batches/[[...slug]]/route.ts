// External libraries
import { z } from 'zod'

// Internal modules
import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createCreateHandler, createListHandler, createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Types and schemas
// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

const CreateProductionSchema = z.object({
  recipe_id: z.string().uuid(),
  quantity: z.number().positive(),
  cost_per_unit: z.number().min(0),
  labor_cost: z.number().min(0).optional().default(0),
  total_cost: z.number().min(0),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().default('PLANNED'),
  planned_start_time: z.string().optional(),
  notes: z.string().max(500).optional(),
}).strict()

const UpdateProductionSchema = z.object({
  quantity: z.number().positive().optional(),
  cost_per_unit: z.number().min(0).optional(),
  labor_cost: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  planned_start_time: z.string().optional(),
  actual_start_time: z.string().optional(),
  actual_end_time: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// GET /api/production-batches or /api/production-batches/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/production-batches',
  },
  async (context) => {
    const { request, params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      // GET /api/production-batches - List production batches
      const validatedQuery = ListQuerySchema.parse(new URL(request.url).searchParams)
      return createListHandler({
        table: 'productions',
        selectFields: '*, recipe:recipes(name, cook_time)',
        defaultSort: 'created_at',
        defaultOrder: 'desc',
      })(context, validatedQuery)
    } else if (slug.length === 1) {
      // GET /api/production-batches/[id] - Get single batch
      return createGetHandler({
        table: 'productions',
        selectFields: '*, recipe:recipes(name, cook_time)',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/production-batches - Create production batch
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/production-batches',
    bodySchema: CreateProductionSchema,
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }
    return createCreateHandler({
      table: 'productions',
      selectFields: '*, recipe:recipes(name, cook_time)',
    }, SUCCESS_MESSAGES.PRODUCTION_BATCH_CREATED)(context, undefined, body)
  }
)

// PUT /api/production-batches/[id] - Update batch
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/production-batches/[id]',
    bodySchema: UpdateProductionSchema,
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createUpdateHandler({
      table: 'productions',
      selectFields: '*, recipe:recipes(name, cook_time)',
    })(context, undefined, body)
  }
)

// DELETE /api/production-batches/[id] - Delete batch
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/production-batches/[id]',
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createDeleteHandler(
      {
        table: 'productions',
      },
      'Production batch deleted successfully'
    )(context)
  }
)