import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { withValidation } from '@/lib/api-core/middleware'
import { handleDatabaseError } from '@/lib/errors'
import { createClient } from '@/utils/supabase/server'
import {
  IdParamSchema,
  IngredientUpdateSchema
} from '@/lib/validations'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase-generated'

type Ingredient = Database['public']['Tables']['ingredients']['Row']
type IngredientUpdate = Database['public']['Tables']['ingredients']['Update']

// GET /api/ingredients/[id] - Get single bahan baku
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    // Validate ID parameter
    const validation = IdParamSchema.safeParse({ id })
    if (!validation.success) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }

    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, category, unit, current_stock, min_stock, weighted_average_cost, supplier_id, notes, created_at, updated_at, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Bahan baku tidak ditemukan', 404)
      }
      return handleDatabaseError(error)
    }

    if (!data) {
      return createErrorResponse('Bahan baku tidak ditemukan', 404)
    }

    return createSuccessResponse(data as Ingredient)

  } catch (error: unknown) {
    return handleDatabaseError(error)
  }
}

// PUT /api/ingredients/[id] - Update bahan baku
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const validationResult = await withValidation(IngredientUpdateSchema)(request)

  if (validationResult instanceof Response) {
    return validationResult
  }

  const validatedData = validationResult

  try {
    // Validate ID parameter
    const idValidation = IdParamSchema.safeParse({ id })
    if (!idValidation.success) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }

    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Update bahan baku
    const { data, error } = await supabase
      .from('ingredients')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, category, unit, current_stock, min_stock, weighted_average_cost, supplier_id, notes, updated_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Bahan baku tidak ditemukan', 404)
      }
      return handleDatabaseError(error)
    }

    return createSuccessResponse(data as Ingredient, 'Bahan baku berhasil diupdate')

  } catch (error: unknown) {
    return handleDatabaseError(error)
  }
}

// DELETE /api/ingredients/[id] - Delete bahan baku
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    // Validate ID parameter
    const validation = IdParamSchema.safeParse({ id })
    if (!validation.success) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }

    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if bahan baku exists and belongs to user
    const { data: existing } = await supabase
      .from('ingredients')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return createErrorResponse('Bahan baku tidak ditemukan', 404)
    }

    // Check if bahan baku is used in recipes (recipe_ingredients table with ingredient_id foreign key)
    const { data: resepItems } = await supabase
      .from('recipe_ingredients')
      .select('id')
      .eq('ingredient_id', id)
      .limit(1)

    if (resepItems && resepItems.length > 0) {
      return createErrorResponse(
        'Tidak dapat menghapus bahan baku yang digunakan dalam resep',
        409
      )
    }

    // Delete bahan baku
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return handleDatabaseError(error)
    }

    return createSuccessResponse(null, 'Bahan baku berhasil dihapus')

  } catch (error: unknown) {
    return handleDatabaseError(error)
  }
}
