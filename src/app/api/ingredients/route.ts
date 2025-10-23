import {
  calculateOffset,
  createPaginationMeta,
  createSuccessResponse,
  handleDatabaseError,
  withQueryValidation,
  withValidation
} from '@/lib/api-validation'
import {
  BahanBakuSchema,
  PaginationSchema
} from '@/lib/validations'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/ingredients - Get all bahan baku with pagination and filtering
export const GET = withQueryValidation(
  PaginationSchema.partial(), // Make all fields optional for GET requests
  async (req: NextRequest, query) => {
    try {
      // Create authenticated Supabase client
      const supabase = await createClient()

      // Validate session
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth error:', authError)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { page = 1, limit = 10, sort, order = 'desc', search } = query
      const offset = calculateOffset(page, limit)

      // Build query - using bahan_baku table
      let supabaseQuery = supabase
        .from('bahan_baku')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .range(offset, offset + limit - 1)

      // Apply search filter - using nama_bahan instead of name
      if (search) {
        supabaseQuery = supabaseQuery.ilike('nama_bahan', `%${search}%`)
      }

      // Apply sorting - default to nama_bahan
      if (sort) {
        supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })
      } else {
        supabaseQuery = supabaseQuery.order('nama_bahan', { ascending: true })
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

    } catch (error: any) {
      return handleDatabaseError(error)
    }
  }
)

// POST /api/ingredients - Create new bahan baku
export const POST = withValidation(
  BahanBakuSchema,
  async (req: NextRequest, validatedData) => {
    try {
      // Create authenticated Supabase client
      const supabase = await createClient()

      // Validate session
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth error:', authError)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { data: insertedData, error } = await supabase
        .from('bahan_baku')
        .insert({
          ...validatedData,
          user_id: user.id
        })
        .select('*')
        .single()

      if (error) {
        return handleDatabaseError(error)
      }

      return createSuccessResponse(insertedData, '201')

    } catch (error: any) {
      return handleDatabaseError(error)
    }
  }
)
