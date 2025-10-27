import {
  createSuccessResponse,
  createErrorResponse,
  handleAPIError,
  withValidation,
  withQueryValidation,
  PaginationSchema,
  calculateOffset,
  createPaginationMeta
} from '@/lib/api-core'
import {
  IngredientInsertSchema,
  IngredientUpdateSchema
} from '@/lib/validations/domains/ingredient'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { apiLogger } from '@/lib/logger'

// Extended schema for ingredients query
const IngredientsQuerySchema = PaginationSchema.extend({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
})
// GET /api/ingredients - Get all bahan baku with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const queryValidation = withQueryValidation(IngredientsQuerySchema)(request)
    if (queryValidation instanceof Response) {
      return queryValidation // Return error response
    }

    const { page = 1, limit = 10, sort, order = 'desc', search } = queryValidation
    const offset = calculateOffset(page, limit)

    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return createErrorResponse('Unauthorized', 401)
    }

    // Build query - using ingredients table
    let supabaseQuery = supabase
      .from('ingredients')
      .select('*', { count: 'exact' })
      .eq('user_id', (user as any).id)
      .range(offset, offset + limit - 1)

    // Apply search filter - using name instead of nama_bahan
    if (search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${search}%`)
    }

    // Apply sorting - default to name
    if (sort) {
      supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })
    } else {
      supabaseQuery = supabaseQuery.order('name', { ascending: true })
    }

    // @ts-ignore
    const { data, error, count } = await supabaseQuery

    if (error) {
      return handleAPIError(error)
    }

    // Create pagination metadata
    const pagination = createPaginationMeta(count || 0, page, limit)

    return createSuccessResponse({
      ingredients: data,
      pagination
    })

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

// POST /api/ingredients - Create new bahan baku
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const bodyValidation = withValidation(IngredientInsertSchema)(request)
    if (bodyValidation instanceof Response) {
      return bodyValidation // Return error response
    }

    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return createErrorResponse('Unauthorized', 401)
    }

    const { data: insertedData, error } = await supabase
      .from('ingredients')
      .insert({
        ...bodyValidation,
        user_id: (user as any).id
      } as any)
      .select('*')
      .single()

    if (error) {
      return handleAPIError(error)
    }

    return createSuccessResponse(insertedData, '201')

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
