import {
  createErrorResponse,
  createSuccessResponse,
  handleDatabaseError,
  withValidation
} from '@/lib/api-validation'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import {
  BahanBakuSchema,
  IdParamSchema
} from '@/lib/validations'
import { NextRequest } from 'next/server'

// GET /api/ingredients/[id] - Get single bahan baku
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Validate ID parameter
    const validation = IdParamSchema.safeParse({ id })
    if (!validation.success) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }

    const supabase = createServerSupabaseAdmin()
    // @ts-ignore
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Bahan baku tidak ditemukan', 404)
      }
      return handleDatabaseError(error)
    }

    return createSuccessResponse(data)

  } catch (error: unknown) {
    return handleDatabaseError(error)
  }
}

// PUT /api/ingredients/[id] - Update bahan baku
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return withValidation(
    BahanBakuSchema.partial(), // Allow partial updates
    async (_req: NextRequest, validatedData) => {
      try {
        // Validate ID parameter
        const idValidation = IdParamSchema.safeParse({ id })
        if (!idValidation.success) {
          return createErrorResponse('Invalid bahan baku ID format', 400)
        }

        const supabase = createServerSupabaseAdmin()

        // Update bahan baku
        // @ts-ignore - Supabase table type mismatch with generated schema
        const { data, error } = await supabase
          .from('ingredients')
          .update(validatedData)
          .eq('id', id)
          .select('*')
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return createErrorResponse('Bahan baku tidak ditemukan', 404)
          }
          return handleDatabaseError(error)
        }

        return createSuccessResponse(data, 'Bahan baku berhasil diupdate')

      } catch (error: unknown) {
        return handleDatabaseError(error)
      }
    }
  )(request)
}

// DELETE /api/ingredients/[id] - Delete bahan baku
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Validate ID parameter
    const validation = IdParamSchema.safeParse({ id })
    if (!validation.success) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }

    const supabase = createServerSupabaseAdmin()

    // Check if bahan baku exists
    const { data: existing } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return createErrorResponse('Bahan baku tidak ditemukan', 404)
    }

    // Check if bahan baku is used in recipes (recipe_ingredients table with ingredient_id foreign key)
    const { data: resepItems } = await supabase
      .from('recipe_ingredients')
      .select('*')
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

    if (error) {
      return handleDatabaseError(error)
    }

    return createSuccessResponse(null, 'Bahan baku berhasil dihapus')

  } catch (error: unknown) {
    return handleDatabaseError(error)
  }
}
