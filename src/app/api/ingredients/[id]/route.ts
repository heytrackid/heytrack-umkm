import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { withValidation } from '@/lib/api-core/middleware'
import { handleDatabaseError } from '@/lib/errors'
import { createClient } from '@/utils/supabase/server'
import { IdParamSchema, IngredientUpdateSchema } from '@/lib/validations'
import { triggerWorkflow } from '@/lib/automation/workflows/index'
import { apiLogger } from '@/lib/logger'
import type { NextRequest } from 'next/server'
import type { IngredientsTable } from '@/types/database'
import { isValidUUID } from '@/lib/type-guards'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type Ingredient = IngredientsTable

// GET /api/ingredients/[id] - Get single bahan baku
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    // Validate UUID format first
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }
    
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
      .select('id, name, category, unit, current_stock, min_stock, weighted_average_cost, description, supplier, created_at, updated_at, user_id')
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
  
  // Validate UUID format first
  if (!isValidUUID(id)) {
    return createErrorResponse('Invalid bahan baku ID format', 400)
  }
  
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

    // Get current ingredient data before update to check for stock changes
    const { data: currentIngredient, error: fetchError } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, min_stock, unit')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return handleDatabaseError(fetchError)
    }

    // Update bahan baku
    const { data, error } = await supabase
      .from('ingredients')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, category, unit, current_stock, min_stock, weighted_average_cost, description, supplier, updated_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Bahan baku tidak ditemukan', 404)
      }
      return handleDatabaseError(error)
    }

    const updatedIngredient = data as Ingredient

    // TRIGGER AUTOMATION WORKFLOWS based on stock changes
    try {
      const oldStock = currentIngredient.current_stock ?? 0
      const newStock = updatedIngredient.current_stock ?? 0
      const minStock = updatedIngredient.min_stock ?? 0

      // Check for stock level changes that trigger automation
      if (newStock <= 0 && oldStock > 0) {
        // Stock went from positive to zero or negative - OUT OF STOCK
        apiLogger.info(`🚨 Out of stock alert triggered for ${updatedIngredient.name}`)
        await triggerWorkflow('inventory.out_of_stock', updatedIngredient.id, {
          ingredient: {
            name: updatedIngredient.name,
            unit: updatedIngredient.unit,
            min_stock: minStock
          },
          previousStock: oldStock,
          currentStock: newStock,
          severity: 'critical'
        })
      } else if (newStock <= minStock && oldStock > minStock) {
        // Stock went from above minimum to at/below minimum - LOW STOCK
        apiLogger.info(`⚠️ Low stock alert triggered for ${updatedIngredient.name}`)
        await triggerWorkflow('inventory.low_stock', updatedIngredient.id, {
          ingredient: {
            name: updatedIngredient.name,
            unit: updatedIngredient.unit,
            min_stock: minStock
          },
          previousStock: oldStock,
          currentStock: newStock,
          severity: newStock <= minStock * 0.5 ? 'critical' : 'warning'
        })
      }

    } catch (automationError) {
      apiLogger.error({ error: automationError }, '⚠️ Inventory automation trigger error (non-blocking):')
      // Don't fail the ingredient update if automation fails
    }

    return createSuccessResponse(updatedIngredient, 'Bahan baku berhasil diupdate')

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
    // Validate UUID format first
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid bahan baku ID format', 400)
    }
    
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
