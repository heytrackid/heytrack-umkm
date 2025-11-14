// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import { extractFirst, getErrorMessage, isRecord, isValidUUID } from '@/lib/type-guards'
import type { IngredientPurchaseUpdate } from '@/lib/validations/database-validations'
import type { BypassRLS, Insert, Update } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

import type { NextRequest, NextResponse } from 'next/server'



interface RouteContext {
  params: Promise<{ id: string }>
}

// Apply security middleware
export const GET = withSecurity(async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']

    // Validate UUID format
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid purchase ID format', 400)
    }

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    // Fetch purchase with ingredient details
    const { data, error } = await supabase
      .from('ingredient_purchases')
      .select(`
        *,
        ingredient:ingredients (
          id,
          name,
          unit,
          current_stock,
          price_per_unit
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return createErrorResponse('Purchase not found', 404)
      }
      apiLogger.error({ error }, 'Error fetching purchase')
      return createErrorResponse('Failed to fetch purchase', 500)
    }

    // Type the data properly
    const typedData = data as {
      id: string
      ingredient_id: string
      quantity: number
      unit_price: number
      total_price: number
      purchase_date: string
      supplier?: string
      notes?: string
      user_id: string
      created_at: string
      updated_at: string
      ingredient: {
        id: string
        name: string
        unit: string
        current_stock: number
        price_per_unit: number
      } | null
    } | null

    // ✅ V2: Validate data structure with type guards
    if (!isRecord(typedData)) {
      apiLogger.error({ data }, 'Invalid purchase data structure')
      return createErrorResponse('Invalid data structure', 500)
    }

    // ✅ V2: Safe extraction of joined ingredient data
    if (isRecord(typedData) && 'ingredient' in typedData) {
      const ingredient = extractFirst(typedData.ingredient)
      if (ingredient && isRecord(ingredient)) {
        // Ingredient data is safely extracted and validated
        apiLogger.info({
          purchaseId: typedData.id,
          ingredientName: ingredient.name
        }, 'Purchase fetched with ingredient details')
      }
    }

    return createSuccessResponse(data)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/ingredient-purchases/[id]')
    return createErrorResponse(getErrorMessage(error), 500)
  }
}, SecurityPresets.enhanced())

export const PUT = withSecurity(async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']

    // Validate UUID format
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid purchase ID format', 400)
    }

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const body = await request.json() as IngredientPurchaseUpdate

    // Get existing purchase
    const { data: existingPurchase, error: fetchError } = await supabase
      .from('ingredient_purchases')
      .select('id, ingredient_id, quantity, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPurchase) {
      return createErrorResponse('Purchase not found', 404)
    }

    // Type the existing purchase
    const typedExistingPurchase = existingPurchase as {
      id: string
      ingredient_id: string
      quantity: number
      user_id: string
    }

    // Calculate stock adjustment
    const oldQuantity = typedExistingPurchase.quantity
    const newQuantity = body.quantity ?? oldQuantity
    const quantityDiff = newQuantity - oldQuantity

    // Update purchase
    const updatePayload: Update<'ingredient_purchases'> = {
      ...(body.supplier !== undefined && { supplier: body.supplier }),
      quantity: newQuantity,
      ...(body.unit_price !== undefined && { unit_price: body.unit_price }),
      total_price: newQuantity * (body.unit_price ?? 0),
      ...(body.purchase_date !== undefined && { purchase_date: body.purchase_date }),
      ...(body.notes !== undefined && { notes: body.notes }),
      updated_at: new Date().toISOString()
    }

    const { data: updatedPurchase, error: updateError } = await supabase
      .from('ingredient_purchases')
      .update(updatePayload as never)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        ingredient:ingredients (
          id,
          name,
          unit,
          current_stock,
          price_per_unit
        )
      `)
      .single()

    if (updateError) {
      apiLogger.error({ error: updateError }, 'Error updating purchase')
      return createErrorResponse('Failed to update purchase', 500)
    }

    // ✅ FIX: Let database trigger handle stock update
    // Only create stock transaction, trigger will auto-update current_stock
    if (quantityDiff !== 0) {
      // Get current stock before adjustment
      const { data: ingredient } = await supabase
        .from('ingredients')
        .select('current_stock')
        .eq('id', typedExistingPurchase.ingredient_id)
        .single()

      const typedIngredient = ingredient as { current_stock: number } | null
      const currentStock = typedIngredient?.current_stock ?? 0

      // Create adjustment transaction - trigger will handle stock update
      const adjustmentTransaction: Insert<'stock_transactions'> = {
        ingredient_id: typedExistingPurchase.ingredient_id,
        type: 'ADJUSTMENT',
        quantity: quantityDiff,
        unit_price: body.unit_price ?? 0,
        total_price: quantityDiff * (body.unit_price ?? 0),
        reference: `PURCHASE-UPDATE-${id}`,
        notes: `Purchase quantity adjusted from ${oldQuantity} to ${newQuantity}`,
        user_id: user.id
      }

      const { error: transactionError } = await supabase
        .from('stock_transactions')
        .insert(adjustmentTransaction as BypassRLS<typeof adjustmentTransaction>)

      if (transactionError) {
        apiLogger.error({ error: transactionError }, 'Failed to create adjustment transaction')
      }

      // Log the change for audit trail
      const stockLog: Insert<'inventory_stock_logs'> = {
        ingredient_id: typedExistingPurchase.ingredient_id,
        quantity_changed: quantityDiff,
        quantity_before: currentStock,
        quantity_after: currentStock + quantityDiff,
        change_type: quantityDiff > 0 ? 'increase' : 'decrease',
        reason: 'Purchase quantity updated',
        reference_id: id,
        reference_type: 'ingredient_purchase'
      }

      await supabase
        .from('inventory_stock_logs')
        .insert(stockLog as BypassRLS<typeof stockLog>)
    }

    return createSuccessResponse(updatedPurchase)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/ingredient-purchases/[id]')
    return createErrorResponse(getErrorMessage(error), 500)
  }
}, SecurityPresets.enhanced())

export const DELETE = withSecurity(async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context['params']

    // Validate UUID format
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid purchase ID format', 400)
    }

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    // Get purchase details
    const { data: purchase, error: fetchError } = await supabase
      .from('ingredient_purchases')
      .select('id, ingredient_id, quantity, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !purchase) {
      return createErrorResponse('Purchase not found', 404)
    }

    // Type the purchase
    const typedPurchase = purchase as {
      id: string
      ingredient_id: string
      quantity: number
      user_id: string
    }

    // Get current stock before reversal
    const { data: ingredient } = await supabase
      .from('ingredients')
      .select('current_stock')
      .eq('id', typedPurchase.ingredient_id)
      .single()

    const typedIngredient = ingredient as { current_stock: number } | null
    const currentStock = typedIngredient?.current_stock ?? 0

    // ✅ FIX: Let database trigger handle stock reversal
    // Create reversal transaction - trigger will auto-update current_stock
    const reversalTransaction: Insert<'stock_transactions'> = {
      ingredient_id: typedPurchase.ingredient_id,
      type: 'ADJUSTMENT',
      quantity: -typedPurchase.quantity, // Negative to reduce stock
      reference: `PURCHASE-DELETE-${typedPurchase.id}`,
      notes: `Purchase deleted - reverting stock`,
      user_id: user.id
    }

    const { error: transactionError } = await supabase
      .from('stock_transactions')
      .insert(reversalTransaction as BypassRLS<typeof reversalTransaction>)

    if (transactionError) {
      apiLogger.error({ error: transactionError }, 'Failed to create reversal transaction')
      return createErrorResponse('Failed to revert stock', 500)
    }

    // Log stock reversal for audit trail
    const reversalLog: Insert<'inventory_stock_logs'> = {
      ingredient_id: typedPurchase.ingredient_id,
      quantity_changed: -typedPurchase.quantity,
      quantity_before: currentStock,
      quantity_after: currentStock - typedPurchase.quantity,
      change_type: 'adjustment',
      reason: 'Purchase deletion',
      reference_id: purchase['id'],
      reference_type: 'ingredient_purchase'
    }

    await supabase
      .from('inventory_stock_logs')
      .insert(reversalLog as BypassRLS<typeof reversalLog>)

    // Delete purchase
    const { error: deleteError } = await supabase
      .from('ingredient_purchases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      apiLogger.error({ error: deleteError }, 'Error deleting purchase')
      return createErrorResponse('Failed to delete purchase', 500)
    }

    return createSuccessResponse(null, 'Purchase deleted successfully')
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/ingredient-purchases/[id]')
    return createErrorResponse(getErrorMessage(error), 500)
  }
}, SecurityPresets.enhanced())
