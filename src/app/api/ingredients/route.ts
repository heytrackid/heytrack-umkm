import { createSuccessResponse, createErrorResponse, handleAPIError, withQueryValidation, PaginationSchema, calculateOffset, createPaginationMeta } from '@/lib/api-core' 
import { z } from 'zod'
import { IngredientInsertSchema } from '@/lib/validations/domains/ingredient' 
import { createClient } from '@/utils/supabase/server'
import { type NextRequest } from 'next/server'
import type { IngredientsInsert } from '@/types/database'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security'

// Extended schema for ingredients query
const IngredientsQuerySchema = PaginationSchema.extend({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
})

// GET /api/ingredients - Get all bahan baku with pagination and filtering
async function GET(request: NextRequest) {
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
    // ✅ OPTIMIZED: Use specific fields instead of SELECT *
    let supabaseQuery = supabase
      .from('ingredients')
      .select(INGREDIENT_FIELDS.LIST, { count: 'exact' })
      .eq('user_id', user.id)
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
      return createErrorResponse(apiError.message, apiError.statusCode)
    }

    // Create pagination metadata
    const pagination = createPaginationMeta(count || 0, page, limit)

    return createSuccessResponse({
      ingredients: data,
      pagination
    })

  } catch (error: unknown) {
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

// POST /api/ingredients - Create new bahan baku
async function POST(request: NextRequest) {
  try {
    // The request body is already validated and sanitized by the security middleware
    const body = await request.json()
    
    // Validate request body
    const validation = IngredientInsertSchema.safeParse(body)
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(issue => issue.message)
      return createErrorResponse('Invalid request data', 400, errorMessages)
    }

    const validatedData = validation.data

    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return createErrorResponse('Unauthorized', 401)
    }

    const ingredientData: IngredientsInsert = {
      ...validatedData,
      user_id: user.id
    }

    const { data: insertedData, error } = await supabase
      .from('ingredients')
      .insert(ingredientData)
      .select('id, name, category, unit, current_stock, min_stock, weighted_average_cost, supplier_id, notes, created_at, updated_at')
      .single()

    if (error) {
      const apiError = handleAPIError(error)
      return createErrorResponse(apiError.message, apiError.statusCode)
    }

    return createSuccessResponse(insertedData, 'Bahan baku berhasil ditambahkan')

  } catch (error: unknown) {
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

// Apply security middleware with enhanced security configuration
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
