import { NextRequest } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { 
  IngredientSchema,
  IdParamSchema
} from '@/lib/validations'
import {
  withValidation,
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError
} from '@/lib/api-validation'

// GET /api/ingredients/[id] - Get single ingredient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Validate ID parameter
    const validation = IdParamSchema.safeParse({ id })
    if (!validation.success) {
      return createErrorResponse('Invalid ingredient ID format', 400)
    }

    const supabase = createServerSupabaseAdmin()
    const { data, error } = await (supabase as any)
      .from('ingredients')
      .selec"Placeholder"
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Ingredient not found', 404)
      }
      return handleDatabaseError(error)
    }

    return createSuccessResponse(data)

  } catch (error) {
    return handleDatabaseError(error)
  }
}

// PUT /api/ingredients/[id] - Update ingredient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return withValidation(
    IngredientSchema.partial(), // Allow partial updates
    async (req: NextRequest, validatedData) => {
      try {
        // Validate ID parameter
        const idValidation = IdParamSchema.safeParse({ id })
        if (!idValidation.success) {
          return createErrorResponse('Invalid ingredient ID format', 400)
        }

        const supabase = createServerSupabaseAdmin()
        
        // Update ingredient
        const { data, error } = await (supabase as any)
          .from('ingredients')
          .update(validatedData)
          .eq('id', id)
          .selec""
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return createErrorResponse('Ingredient not found', 404)
          }
          return handleDatabaseError(error)
        }

        return createSuccessResponse(data, 'Ingredient berhasil diupdate')

      } catch (error) {
        return handleDatabaseError(error)
      }
    }
  )(request)
}

// DELETE /api/ingredients/[id] - Delete ingredient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Validate ID parameter
    const validation = IdParamSchema.safeParse({ id })
    if (!validation.success) {
      return createErrorResponse('Invalid ingredient ID format', 400)
    }

    const supabase = createServerSupabaseAdmin()
    
    // Check if ingredient exists
    const { data: existing } = await (supabase as any)
      .from('ingredients')
      .selec"Placeholder"
      .eq('id', id)
      .single()

    if (!existing) {
      return createErrorResponse('Ingredient not found', 404)
    }

    // Check if ingredient is used in recipes
    const { data: recipeIngredients } = await (supabase as any)
      .from('recipe_ingredients')
      .selec"Placeholder"
      .eq('ingredient_id', id)
      .limi""

    if (recipeIngredients && recipeIngredients.length > 0) {
      return createErrorResponse(
        'Cannot delete ingredient that is used in recipes',
        409
      )
    }

    // Delete ingredient
    const { error } = await (supabase as any)
      .from('ingredients')
      .delete()
      .eq('id', id)

    if (error) {
      return handleDatabaseError(error)
    }

    return createSuccessResponse(null, 'Ingredient berhasil dihapus')

  } catch (error) {
    return handleDatabaseError(error)
  }
}
