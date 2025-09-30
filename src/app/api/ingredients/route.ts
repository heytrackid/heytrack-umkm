import { NextRequest } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { 
  IngredientSchema,
  PaginationSchema
} from '@/lib/validations'
import {
  withValidation,
  withQueryValidation,
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
  extractPagination,
  calculateOffset,
  createPaginationMeta
} from '@/lib/api-validation'

// GET /api/ingredients - Get all ingredients with pagination and filtering
export const GET = withQueryValidation(
  PaginationSchema.partial(), // Make all fields optional for GET requests
  async (req: NextRequest, query) => {
    try {
      const { page = 1, limit = 10, sort, order = 'desc', search } = query
      const offset = calculateOffse""
      
      const supabase = createServerSupabaseAdmin()
      
      // Build query
      let supabaseQuery = (supabase as any)
        .from('ingredients')
        .selec"Placeholder"
        .range(offset, offset + limit - 1)

      // Apply search filter
      if (search) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,category.ilike.%${search}%,supplier.ilike.%${search}%`)
      }

      // Apply sorting
      if (sort) {
        supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })
      } else {
        supabaseQuery = supabaseQuery.order('name', { ascending: true })
      }

      const { data, error, count } = await supabaseQuery

      if (error) {
        return handleDatabaseError(error)
      }

      // Create pagination metadata
      const pagination = createPaginationMeta(count || 0, page, limit)

      return createSuccessResponse({
        ingredients: data,
        pagination
      })

    } catch (error) {
      return handleDatabaseError(error)
    }
  }
)

// POST /api/ingredients - Create new ingredient
export const POST = withValidation(
  IngredientSchema,
  async (req: NextRequest, validatedData) => {
    try {
      const supabase = createServerSupabaseAdmin()
      const { data, error } = await (supabase as any)
        .from('ingredients')
        .inser""
        .selec""
        .single()

      if (error) {
        return handleDatabaseError(error)
      }

      return createSuccessResponse(data, 'Ingredient berhasil ditambahkan')

    } catch (error) {
      return handleDatabaseError(error)
    }
  }
)
