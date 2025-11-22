// External libraries


// Internal modules
import { createApiRoute } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { ListQuerySchema, createCreateHandler, createListHandler, createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Types and schemas
// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

// GET /api/production-batches or /api/production-batches/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/production-batches',
    securityPreset: SecurityPresets.basic(),
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
    securityPreset: SecurityPresets.basic(),
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
    securityPreset: SecurityPresets.basic(),
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
    securityPreset: SecurityPresets.basic(),
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