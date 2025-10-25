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

import { apiLogger } from '@/lib/logger'
// GET /api/ingredients - Get all bahan baku with pagination and filtering
export const GET = withQueryValidation(
  PaginationSchema.partial(), // Make all fields optional for GET requests
  async (_req: NextRequest, query) => {
    try {
      // Create authenticated Supabase client
      const supabase = await createClient()

      // Validate session
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        apiLogger.error({ error: authError }, 'Auth error:')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { page = 1, limit = 10, sort, order = 'desc', search } = query
      const offset = calculateOffset(page, limit)

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
        return handleDatabaseError(error)
      }

      // Create pagination metadata
      const pagination = createPaginationMeta(count || 0, page, limit)

      return createSuccessResponse({
        ingredients: data,
        pagination
      })

    } catch (error: unknown) {
      return handleDatabaseError(error)
    }
  }
)

// POST /api/ingredients - Create new bahan baku
export const POST = withValidation(
  BahanBakuSchema,
  async (_req: NextRequest, validatedData) => {
    try {
      // Create authenticated Supabase client
      const supabase = await createClient()

      // Validate session
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        apiLogger.error({ error: authError }, 'Auth error:')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { data: insertedData, error } = await supabase
        .from('ingredients')
        .insert({
          ...validatedData,
          user_id: (user as any).id
        } as any)
        .select('*')
        .single()

      if (error) {
        return handleDatabaseError(error)
      }

      return createSuccessResponse(insertedData, '201')

    } catch (error: unknown) {
      return handleDatabaseError(error)
    }
  }
)
