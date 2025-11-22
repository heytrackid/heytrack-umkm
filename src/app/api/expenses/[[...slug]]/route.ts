// External libraries

// Internal modules
import { calculateOffset, createPaginationMeta, createSuccessResponse } from '@/lib/api-core'
import { createDeleteHandler, createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'



// GET /api/expenses or /api/expenses/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/expenses',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery: unknown) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/expenses - List expenses
      const { user, supabase } = context
      const query = (validatedQuery as Record<string, unknown>) || {}
      const {
        page = 1,
        limit = 1000,
        sort = 'date',
        order = 'desc',
        search,
        category,
        startDate,
        endDate,
      } = query as {
        page?: number
        limit?: number
        sort?: string
        order?: 'asc' | 'desc'
        search?: string
        category?: string
        startDate?: string
        endDate?: string
      }

      const offset = calculateOffset(page, limit)

      let supabaseQuery = supabase
        .from('financial_records' as never)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('type', 'EXPENSE')
        .range(offset, offset + limit - 1)

      if (search) {
        supabaseQuery = supabaseQuery.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
      }

      if (category) {
        supabaseQuery = supabaseQuery.eq('category', category)
      }

      if (startDate) {
        supabaseQuery = supabaseQuery.gte('date', startDate)
      }

      if (endDate) {
        supabaseQuery = supabaseQuery.lte('date', endDate)
      }

      supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })

      const { data, error, count } = await supabaseQuery

      if (error) {
        return handleAPIError(new Error('Failed to fetch expenses'), 'API Route')
      }

      const pagination = createPaginationMeta(count ?? 0, page, limit)

      return createSuccessResponse(data, undefined, pagination)
    } else if (slug && slug.length === 1) {
      // GET /api/expenses/[id] - Get single expense
      return createGetHandler({
        table: 'financial_records',
        selectFields: '*',
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
  }
)



// PUT /api/expenses/[id] - Update expense
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/expenses/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug']
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    return createUpdateHandler({
      table: 'financial_records',
      selectFields: '*',
    }, SUCCESS_MESSAGES.EXPENSE_UPDATED)(context, undefined, body)
  }
)

// POST /api/expenses - Create expense
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/expenses',
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const slug = context.params?.['slug']
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'API Route')
    }

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const { user, supabase } = context

    const insertData = {
      ...body,
      user_id: user.id,
      type: 'EXPENSE' as const,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data, error } = await supabase
      .from('financial_records' as never)
      .insert(insertData as never)
      .select()
      .single()

    if (error) {
      return handleAPIError(new Error('Failed to create expense'), 'API Route')
    }

    return createSuccessResponse(data, SUCCESS_MESSAGES.EXPENSE_CREATED, undefined, 201)
  }
)

// DELETE /api/expenses/[id] - Delete expense
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/expenses/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context) => {
    const slug = context.params?.['slug']
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }
    return createDeleteHandler(
      {
        table: 'financial_records',
      },
      SUCCESS_MESSAGES.EXPENSE_DELETED
    )(context)
  }
)