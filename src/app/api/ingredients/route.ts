// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest } from 'next/server'
import { z } from 'zod'

import { createSuccessResponse, createErrorResponse, handleAPIError, withQueryValidation, PaginationSchema, calculateOffset, createPaginationMeta } from '@/lib/api-core'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { IngredientInsertSchema } from '@/lib/validations/domains/ingredient'
import type { Insert } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'



// Extended schema for ingredients query
const IngredientsQuerySchema = PaginationSchema.extend({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
})

// GET /api/ingredients - Get all bahan baku with pagination and filtering
async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate query parameters
    const queryValidation = withQueryValidation(IngredientsQuerySchema)(request)
    if (queryValidation instanceof Response) {
      return queryValidation // Return error response
    }

    const { page = 1, limit = 10, sort, order = 'desc', search } = queryValidation
    const offset = calculateOffset(page, limit)

    // Create authenticated Supabase client
    const supabase = typed(await createClient())

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return createErrorResponse('Unauthorized', 401)
    }

    // Build query - using ingredients table
    // ✅ OPTIMIZED: Use specific fields instead of SELECT *
    let supabaseQuery = supabase
      .from('ingredients')
      .select(INGREDIENT_FIELDS.LIST, { count: 'exact' })
      .eq('user_id', user['id'])
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

    const { data, error, count } = await supabaseQuery

    if (error) {
      const apiError = handleAPIError(error)
      return createErrorResponse(apiError.message, apiError['statusCode'])
    }

    // Create pagination metadata
    const pagination = createPaginationMeta(count ?? 0, page, limit)

    const response = createSuccessResponse({
      ingredients: data,
      pagination
    })
    // Add caching for ingredients list (2 minutes stale-while-revalidate)
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
    return response

  } catch (error: unknown) {
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError['statusCode'])
  }
}

// POST /api/ingredients - Create new bahan baku
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    let _body: unknown
    try {
      _body = await request.json()
    } catch (error) {
      apiLogger.error({ error }, 'Failed to parse request body')
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    // Validate request body
    const validation = IngredientInsertSchema.safeParse(_body)
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(issue => issue.message)
      return createErrorResponse('Invalid request data', 400, errorMessages)
    }

    const validatedData = validation['data']

    // Create authenticated Supabase client
    const supabase = typed(await createClient())

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return createErrorResponse('Unauthorized', 401)
    }
    const ingredientData = {
      user_id: user['id'],
      name: validatedData.name,
      unit: validatedData.unit,
      price_per_unit: validatedData.price_per_unit,
      current_stock: validatedData.current_stock,
      min_stock: validatedData.min_stock,
      category: validatedData.category ?? null,
      max_stock: validatedData.max_stock ?? null,
      supplier: validatedData.supplier ?? null,
      description: validatedData.description ?? null,
      is_active: validatedData.is_active ?? true,
    } as Insert<'ingredients'>

    const { data: insertedData, error } = await supabase
      .from('ingredients')
      .insert(ingredientData)
      .select('id, name, category, unit, current_stock, min_stock, weighted_average_cost, supplier_id, notes, created_at, updated_at')
      .single()

    if (error) {
      const apiError = handleAPIError(error)
      return createErrorResponse(apiError.message, apiError['statusCode'])
    }

    return createSuccessResponse(insertedData, 'Bahan baku berhasil ditambahkan')

  } catch (error: unknown) {
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError['statusCode'])
  }
}

// Apply security middleware with basic security configuration
const securedGET = withSecurity(GET, SecurityPresets.basic())
const securedPOST = withSecurity(POST, SecurityPresets.basic())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
