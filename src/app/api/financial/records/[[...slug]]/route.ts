// External libraries
import { z } from 'zod'

// Internal modules
import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler, createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { createSuccessResponse, withQueryValidation } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

const FinancialRecordSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
})

const UpdateFinancialRecordSchema = z.object({
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
})

// GET /api/financial/records or /api/financial/records/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/financial/records',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { request, params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      // GET /api/financial/records - List financial records
      const queryValidation = withQueryValidation(ListQuerySchema)(request)
      if (queryValidation instanceof Response) {
        return queryValidation
      }
      const validatedQuery = queryValidation as z.infer<typeof ListQuerySchema>
      return createListHandler({
        table: 'financial_records',
        selectFields: '*',
        defaultSort: 'date',
        defaultOrder: 'desc',
        searchFields: ['description', 'category'],
      })(context, validatedQuery)
    } else if (slug.length === 1) {
      // GET /api/financial/records/[id] - Get single record
      return createGetHandler({
        table: 'financial_records',
        selectFields: '*',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)

// POST /api/financial/records - Create manual financial record
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/financial/records',
    securityPreset: SecurityPresets.enhanced(),
    bodySchema: FinancialRecordSchema,
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }

    const { user, supabase } = context

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const insertData = {
      user_id: user.id,
      type: body.type as 'INCOME' | 'EXPENSE',
      description: body.description,
      category: body.type === 'INCOME' ? 'Revenue' : body.category,
      amount: body.amount,
      date: body.date,
      reference: `MANUAL-${Date.now()}`,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data, error } = await supabase
      .from('financial_records' as never)
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      return handleAPIError(new Error('Failed to create financial record'), 'API Route')
    }

    return createSuccessResponse(data, SUCCESS_MESSAGES.FINANCIAL_RECORD_CREATED, undefined, 201)
  }
)

// PUT /api/financial/records/[id] - Update record
export const PUT = createApiRoute(
  {
    method: 'PUT',
    securityPreset: SecurityPresets.enhanced(),
    path: '/api/financial/records/[id]',
    bodySchema: UpdateFinancialRecordSchema,
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug'] as string[] | undefined
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createUpdateHandler({
      table: 'financial_records',
      selectFields: '*',
    }, SUCCESS_MESSAGES.FINANCIAL_RECORD_UPDATED)(context, undefined, body)
  }
)

// DELETE /api/financial/records/[id] - Delete record
export const DELETE = createApiRoute(
  {
    securityPreset: SecurityPresets.enhanced(),
    method: 'DELETE',
    path: '/api/financial/records/[id]',
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
      SUCCESS_MESSAGES.FINANCIAL_RECORD_DELETED
    )(context)
  }
)