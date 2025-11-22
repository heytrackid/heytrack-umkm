// External libraries
// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { ListQuerySchema, createListHandler, createGetHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'

export const runtime = 'nodejs'

// GET /api/sales or /api/sales/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/sales',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/sales - List sales records
      return createListHandler({
        table: 'financial_records',
        selectFields: '*',
        defaultSort: 'date',
        defaultOrder: 'desc',
        searchFields: ['description', 'category'],
      })(context, validatedQuery)
    } else if (slug && slug.length === 1) {
      // GET /api/sales/[id] - Get single sale record
      return createGetHandler({
        table: 'financial_records',
        selectFields: '*',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// DELETE /api/sales/[id] - Delete sale record
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/sales/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createDeleteHandler(
      {
        table: 'financial_records',
      },
      'Sale record deleted successfully'
    )(context)
  }
)