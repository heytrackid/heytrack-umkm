import type { NextResponse } from 'next/server'
import { z } from 'zod'

import { PaginationSchema, calculateOffset, createPaginationMeta, createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import type { RouteContext } from './route-factory'

type TableName = keyof Database['public']['Tables']

export interface CrudConfig<TTable extends TableName = TableName> {
  table: TTable
  selectFields?: string
  defaultSort?: string
  defaultOrder?: 'asc' | 'desc'
  searchFields?: string[]
  userIdField?: string
}

// Extended pagination schema with sorting and search
export const ListQuerySchema = PaginationSchema.extend({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

export type ListQuery = z.infer<typeof ListQuerySchema>

/**
 * Generic GET handler for listing resources with pagination, search, and sorting
 */
export function createListHandler<TTable extends TableName>(config: CrudConfig<TTable>) {
  const {
    table,
    selectFields = '*',
    defaultSort = 'created_at',
    defaultOrder = 'desc',
    searchFields = ['name'],
    userIdField = 'user_id',
  } = config

  return async (context: RouteContext, query?: ListQuery): Promise<NextResponse> => {
    try {
      const { user, supabase } = context
      const {
        page = 1,
        limit = 1000,
        sort = defaultSort,
        order = defaultOrder,
        search,
      } = query || {}

      const offset = calculateOffset(page, limit)

      // Build query with user scoping
      let supabaseQuery = supabase
        .from(table as never)
        .select(selectFields, { count: 'exact' })
        .eq(userIdField, user.id)
        .range(offset, offset + limit - 1)

      // Apply search across configured fields
      if (search && searchFields.length > 0) {
        const searchConditions = searchFields.map(field => `${field}.ilike.%${search}%`).join(',')
        supabaseQuery = supabaseQuery.or(searchConditions)
      }

      // Apply sorting
      supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })

      const { data, error, count } = await supabaseQuery

      if (error) {
        apiLogger.error({ error, table }, 'Failed to fetch resources')
        return handleAPIError(error, `GET /api/${table}`)
      }

      const pagination = createPaginationMeta(count ?? 0, page, limit)

      const response = createSuccessResponse(data, undefined, pagination)

      // Add cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
      
      return response
    } catch (error) {
      apiLogger.error({ error, table }, 'Unhandled error in list handler')
      return handleAPIError(error, `GET /api/${table}`)
    }
  }
}

/**
 * Generic POST handler for creating resources
 */
export function createCreateHandler<TTable extends TableName, TInsert = unknown>(
  config: CrudConfig<TTable>,
  successMessage = 'Resource created successfully'
) {
  const { table, selectFields = '*', userIdField = 'user_id' } = config

  // Tables that have created_by/updated_by columns
  const tablesWithAuditFields = [
    'recipes', 'ingredients', 'customers', 'orders', 'productions', 
    'operational_costs', 'ingredient_purchases'
  ]

  return async (context: RouteContext, _query?: never, body?: TInsert): Promise<NextResponse> => {
    try {
      const { user, supabase } = context

      if (!body) {
        return handleAPIError(new Error('Request body is required'), `POST /api/${table}`)
      }

      // Add user context to the data
      const dataWithUser: Record<string, unknown> = {
        ...body,
        [userIdField]: user.id,
      }

      // Only add audit fields for tables that support them
      if (tablesWithAuditFields.includes(table)) {
        dataWithUser['created_by'] = user.id
        dataWithUser['updated_by'] = user.id
      }

      const { data, error } = await supabase
        .from(table as never)
        .insert(dataWithUser as never)
        .select(selectFields)
        .single()

      if (error) {
        apiLogger.error({ error, table, body: dataWithUser }, 'Failed to create resource')
        return handleAPIError(error, `POST /api/${table}`)
      }

      return createSuccessResponse(data, successMessage, undefined, 201)
    } catch (error) {
      apiLogger.error({ error, table }, 'Unhandled error in create handler')
      return handleAPIError(error, `POST /api/${table}`)
    }
  }
}

/**
 * Generic GET handler for fetching a single resource by ID
 */
export function createGetHandler<TTable extends TableName>(config: CrudConfig<TTable>) {
  const { table, selectFields = '*', userIdField = 'user_id' } = config

  return async (context: RouteContext): Promise<NextResponse> => {
    try {
      const { user, supabase, params } = context
      const id = params?.['id']

      if (!id) {
        return handleAPIError(new Error('Resource ID is required'), `GET /api/${table}`)
      }

      const { data, error } = await supabase
        .from(table as never)
        .select(selectFields)
        .eq('id', id)
        .eq(userIdField, user.id)
        .single()

      if (error) {
        apiLogger.error({ error, table, id }, 'Failed to fetch resource')

        if (error.code === 'PGRST116') {
          return handleAPIError(new Error('Resource not found'), `GET /api/${table}`)
        }

        return handleAPIError(error, `GET /api/${table}`)
      }

      return createSuccessResponse(data)
    } catch (error) {
      apiLogger.error({ error, table }, 'Unhandled error in get handler')
      return handleAPIError(error, `GET /api/${table}`)
    }
  }
}

/**
 * Generic PUT/PATCH handler for updating resources
 */
export function createUpdateHandler<TTable extends TableName, TUpdate = unknown>(
  config: CrudConfig<TTable>,
  successMessage = 'Resource updated successfully'
) {
  const { table, selectFields = '*', userIdField = 'user_id' } = config

  // Tables that have updated_by column
  const tablesWithAuditFields = [
    'recipes', 'ingredients', 'customers', 'orders', 'productions', 
    'operational_costs', 'ingredient_purchases'
  ]

  return async (context: RouteContext, _query?: never, body?: TUpdate): Promise<NextResponse> => {
    try {
      const { user, supabase, params } = context
      const id = params?.['id']

      if (!id) {
        return handleAPIError(new Error('Resource ID is required'), `PUT /api/${table}`)
      }

      if (!body) {
        return handleAPIError(new Error('Request body is required'), `PUT /api/${table}`)
      }

      // Add updated_by to track changes only for tables that support it
      const dataWithUser: Record<string, unknown> = { ...body }
      if (tablesWithAuditFields.includes(table)) {
        dataWithUser['updated_by'] = user.id
      }

      const { data, error } = await supabase
        .from(table as never)
        .update(dataWithUser as never)
        .eq('id', id)
        .eq(userIdField, user.id)
        .select(selectFields)
        .single()

      if (error) {
        apiLogger.error({ error, table, id }, 'Failed to update resource')

        if (error.code === 'PGRST116') {
          return handleAPIError(new Error('Resource not found'), `PUT /api/${table}`)
        }

        return handleAPIError(error, `PUT /api/${table}`)
      }

      return createSuccessResponse(data, successMessage)
    } catch (error) {
      apiLogger.error({ error, table }, 'Unhandled error in update handler')
      return handleAPIError(error, `PUT /api/${table}`)
    }
  }
}

/**
 * Generic DELETE handler for deleting resources
 */
export function createDeleteHandler<TTable extends TableName>(
  config: CrudConfig<TTable>,
  successMessage = 'Resource deleted successfully'
) {
  const { table, userIdField = 'user_id' } = config

  return async (context: RouteContext): Promise<NextResponse> => {
    try {
      const { user, supabase, params } = context
      const id = params?.['id']

      if (!id) {
        return handleAPIError(new Error('Resource ID is required'), `DELETE /api/${table}`)
      }

      const { error } = await supabase
        .from(table as never)
        .delete()
        .eq('id', id)
        .eq(userIdField, user.id)

      if (error) {
        apiLogger.error({ error, table, id }, 'Failed to delete resource')

        if (error.code === 'PGRST116') {
          return handleAPIError(new Error('Resource not found'), `DELETE /api/${table}`)
        }

        return handleAPIError(error, `DELETE /api/${table}`)
      }

      return createSuccessResponse({ id }, successMessage)
    } catch (error) {
      apiLogger.error({ error, table }, 'Unhandled error in delete handler')
      return handleAPIError(error, `DELETE /api/${table}`)
    }
  }
}

/**
 * Creates a complete CRUD route set for a resource
 */
export function createCrudHandlers<TTable extends TableName, TInsert = unknown, TUpdate = unknown>(
  config: CrudConfig<TTable>,
  messages?: {
    create?: string
    update?: string
    delete?: string
  }
) {
  return {
    list: createListHandler(config),
    create: createCreateHandler<TTable, TInsert>(config, messages?.create),
    get: createGetHandler(config),
    update: createUpdateHandler<TTable, TUpdate>(config, messages?.update),
    delete: createDeleteHandler(config, messages?.delete),
  }
}
