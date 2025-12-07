// External libraries
import { z } from 'zod'

// Internal modules
import { createSuccessResponse, withQueryValidation } from '@/lib/api-core'
import { ListQuerySchema, createDeleteHandler, createGetHandler, createListHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { RequiredString, PositiveNumberSchema, DateStringSchema } from '@/lib/validations/common'

// Types and schemas
// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

const FinancialRecordSchema = z.object({
  description: RequiredString,
  category: RequiredString,
  amount: PositiveNumberSchema,
  date: DateStringSchema,
  type: z.enum(['INCOME', 'EXPENSE']),
})

const UpdateFinancialRecordSchema = z.object({
  description: RequiredString.optional(),
  category: RequiredString.optional(),
  amount: PositiveNumberSchema.optional(),
  date: DateStringSchema.optional(),
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
      // Pass the ID from slug to context.params for createGetHandler
      const contextWithId = {
        ...context,
        params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
      }
      return createGetHandler({
        table: 'financial_records',
        selectFields: '*',
      })(contextWithId)
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
    }

    const { data, error } = await supabase
      .from('financial_records')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      const { apiLogger } = await import('@/lib/logger')
      apiLogger.error({ error, insertData }, 'Failed to create financial record')
      return handleAPIError(new Error(`Failed to create financial record: ${error.message}`), 'API Route')
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
    // Pass the ID from slug to context.params for createUpdateHandler
    const contextWithId = {
      ...context,
      params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
    }
    return createUpdateHandler({
      table: 'financial_records',
      selectFields: '*',
    }, SUCCESS_MESSAGES.FINANCIAL_RECORD_UPDATED)(contextWithId, undefined, body)
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
    // Pass the ID from slug to context.params for createDeleteHandler
    const contextWithId = {
      ...context,
      params: { ...context.params, id: slug[0] } as Record<string, string | string[]>
    }
    return createDeleteHandler(
      {
        table: 'financial_records',
      },
      SUCCESS_MESSAGES.FINANCIAL_RECORD_DELETED
    )(contextWithId)
  }
)