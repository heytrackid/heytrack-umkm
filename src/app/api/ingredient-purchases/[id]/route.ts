import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { IngredientPurchasesUpdate, StockTransactionsInsert, InventoryStockLogsInsert } from '@/types/database'
import { getErrorMessage, isValidUUID, isRecord, extractFirst } from '@/lib/type-guards'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/ingredient-purchases/[id] - Get single purchase
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid purchase ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching purchase')
      return NextResponse.json({ error: 'Failed to fetch purchase' }, { status: 500 })
    }

    // ✅ V2: Validate data structure with type guards
    if (!isRecord(data)) {
      apiLogger.error({ data }, 'Invalid purchase data structure')
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 500 })
    }

    // ✅ V2: Safe extraction of joined ingredient data
    if (isRecord(data) && 'ingredient' in data) {
      const ingredient = extractFirst(data.ingredient)
      if (ingredient && isRecord(ingredient)) {
        // Ingredient data is safely extracted and validated
        apiLogger.info({ 
          purchaseId: data.id, 
          ingredientName: ingredient.name 
        }, 'Purchase fetched with ingredient details')
      }
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/ingredient-purchases/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// PUT /api/ingredient-purchases/[id] - Update purchase
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid purchase ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get existing purchase
    const { data: existingPurchase, error: fetchError } = await supabase
      .from('ingredient_purchases')
      .select('id, ingredient_id, quantity, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Calculate stock adjustment
    const oldQuantity = existingPurchase.quantity
    const newQuantity = body.quantity || oldQuantity
    const quantityDiff = newQuantity - oldQuantity

    // Update purchase
    const updatePayload: IngredientPurchasesUpdate = {
      supplier: body.supplier,
      quantity: newQuantity,
      unit_price: body.unit_price,
      total_price: newQuantity * (body.unit_price || 0),
      purchase_date: body.purchase_date,
      notes: body.notes,
      updated_at: new Date().toISOString()
    }

    const { data: updatedPurchase, error: updateError } = await supabase
      .from('ingredient_purchases')
      .update(updatePayload)
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
      return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 })
    }

    // ✅ FIX: Let database trigger handle stock update
    // Only create stock transaction, trigger will auto-update current_stock
    if (quantityDiff !== 0) {
      // Get current stock before adjustment
      const { data: ingredient } = await supabase
        .from('ingredients')
        .select('current_stock')
        .eq('id', existingPurchase.ingredient_id)
        .single()

      const currentStock = ingredient?.current_stock || 0

      // Create adjustment transaction - trigger will handle stock update
      const adjustmentTransaction: StockTransactionsInsert = {
        ingredient_id: existingPurchase.ingredient_id,
        type: 'ADJUSTMENT',
        quantity: quantityDiff,
        unit_price: body.unit_price || 0,
        total_price: quantityDiff * (body.unit_price || 0),
        reference: `PURCHASE-UPDATE-${id}`,
        notes: `Purchase quantity adjusted from ${oldQuantity} to ${newQuantity}`,
        user_id: user.id
      }

      const { error: transactionError } = await supabase
        .from('stock_transactions')
        .insert(adjustmentTransaction)

      if (transactionError) {
        apiLogger.error({ error: transactionError }, 'Failed to create adjustment transaction')
      }

      // Log the change for audit trail
      const stockLog: InventoryStockLogsInsert = {
        ingredient_id: existingPurchase.ingredient_id,
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
        .insert(stockLog)
    }

    return NextResponse.json(updatedPurchase)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/ingredient-purchases/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/ingredient-purchases/[id] - Delete purchase and revert stock
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid purchase ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get purchase details
    const { data: purchase, error: fetchError } = await supabase
      .from('ingredient_purchases')
      .select('id, ingredient_id, quantity, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Get current stock before reversal
    const { data: ingredient } = await supabase
      .from('ingredients')
      .select('current_stock')
      .eq('id', purchase.ingredient_id)
      .single()

    const currentStock = ingredient?.current_stock || 0

    // ✅ FIX: Let database trigger handle stock reversal
    // Create reversal transaction - trigger will auto-update current_stock
    const reversalTransaction: StockTransactionsInsert = {
      ingredient_id: purchase.ingredient_id,
      type: 'ADJUSTMENT',
      quantity: -purchase.quantity, // Negative to reduce stock
      reference: `PURCHASE-DELETE-${purchase.id}`,
      notes: `Purchase deleted - reverting stock`,
      user_id: user.id
    }

    const { error: transactionError } = await supabase
      .from('stock_transactions')
      .insert(reversalTransaction)

    if (transactionError) {
      apiLogger.error({ error: transactionError }, 'Failed to create reversal transaction')
      return NextResponse.json({ error: 'Failed to revert stock' }, { status: 500 })
    }

    // Log stock reversal for audit trail
    const reversalLog: InventoryStockLogsInsert = {
      ingredient_id: purchase.ingredient_id,
      quantity_changed: -purchase.quantity,
      quantity_before: currentStock,
      quantity_after: currentStock - purchase.quantity,
      change_type: 'adjustment',
      reason: 'Purchase deletion',
      reference_id: purchase.id,
      reference_type: 'ingredient_purchase'
    }

    await supabase
      .from('inventory_stock_logs')
      .insert(reversalLog)

    // Delete purchase
    const { error: deleteError } = await supabase
      .from('ingredient_purchases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      apiLogger.error({ error: deleteError }, 'Error deleting purchase')
      return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Purchase deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/ingredient-purchases/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
