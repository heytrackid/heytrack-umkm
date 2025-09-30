import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

// POST /api/inventory/auto-update - Auto-update inventory based on order changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, action, order_items } = body
    
    // Validate required fields
    if (!order_id || !action || !order_items || !Array.isArray(order_items)) {
      return NextResponse.json(
        { error: 'order_id, action, and order_items array are required' },
        { status: 400 }
      )
    }
    
    if (!['order_created', 'order_completed', 'order_cancelled'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: order_created, order_completed, order_cancelled' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseAdmin()
    const results = []
    
    // Process each order item
    for (const orderItem of order_items) {
      const { recipe_id, quantity } = orderItem
      
      if (!recipe_id || !quantity) {
        continue // Skip invalid items
      }
      
      // Get recipe ingredients
      const { data: recipe, error: recipeError } = await (supabase as any)
        .from('recipes')
        .select(`
          id,
          name,
          servings,
          recipe_ingredients (
            ingredient_id,
            quantity,
            unit,
            ingredient:ingredients (
              id,
              name,
              stock,
              unit
            )
          )
        `)
        .eq('id', recipe_id)
        .single()
      
      if (recipeError || !recipe) {
        results.push({
          recipe_id,
          status: 'error',
          message: 'Recipe not found'
        })
        continue
      }
      
      // Calculate total ingredient needs for this order quantity
      const batchCount = Math.ceil(quantity / recipe.servings)
      const inventoryUpdates = []
      const stockTransactions = []
      
      for (const ri of recipe.recipe_ingredients) {
        const ingredientUsed = ri.quantity * batchCount
        const newStock = Math.max(0, ri.ingredient.stock - ingredientUsed)
        
        // Prepare stock transaction based on action
        let transactionType = 'USAGE'
        let transactionQuantity = ingredientUsed
        let transactionNote = ''
        
        switch (action) {
          case 'order_created':
            // Reserve stock but don't actually deduct yet
            transactionType = 'USAGE'
            transactionNote = `Reserved for order ${order_id} - ${recipe.name} (${quantity} units)`
            break
          case 'order_completed':
            // Actually deduct the stock
            transactionType = 'USAGE'
            transactionNote = `Used for completed order ${order_id} - ${recipe.name} (${quantity} units)`
            break
          case 'order_cancelled':
            // Return reserved stock (add back)
            transactionType = 'ADJUSTMENT'
            transactionQuantity = -ingredientUsed // Negative for return
            transactionNote = `Returned from cancelled order ${order_id} - ${recipe.name} (${quantity} units)`
            break
        }
        
        inventoryUpdates.push({
          ingredient_id: ri.ingredient.id,
          ingredient_name: ri.ingredient.name,
          old_stock: ri.ingredient.stock,
          new_stock: action === 'order_cancelled' 
            ? ri.ingredient.stock + ingredientUsed // Add back for cancelled
            : newStock,
          used_quantity: ingredientUsed
        })
        
        stockTransactions.push({
          ingredient_id: ri.ingredient.id,
          type: transactionType,
          quantity: Math.abs(transactionQuantity),
          reference: order_id,
          notes: transactionNote
        })
        
        // Update ingredient stock
        const finalStock = action === 'order_cancelled' 
          ? ri.ingredient.stock + ingredientUsed
          : newStock
          
        const { error: updateError } = await (supabase as any)
          .from('ingredients')
          .update({ 
            stock: finalStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', ri.ingredient.id)
        
        if (updateError) {
          console.error('Error updating ingredient stock:', updateError)
        }
      }
      
      // Insert stock transactions
      if (stockTransactions.length > 0) {
        const { error: transactionError } = await (supabase as any)
          .from('stock_transactions')
          .insert(data)
        
        if (transactionError) {
          console.error('Error creating stock transactions:', transactionError)
        }
      }
      
      results.push({
        recipe_id,
        recipe_name: recipe.name,
        quantity: quantity,
        batch_count: batchCount,
        status: 'success',
        action: action,
        inventory_updates: inventoryUpdates,
        message: `Inventory updated for ${recipe.name}`
      })
    }
    
    // Check for low stock alerts
    const lowStockAlerts = await checkLowStockAlerts(supabase, results)
    
    return NextResponse.json({
      success: true,
      action,
      order_id,
      processed_items: results.length,
      results,
      low_stock_alerts: lowStockAlerts,
      message: `Inventory auto-update completed for ${action}`
    })
    
  } catch (error) {
    console.error('Error in inventory auto-update:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}

// Helper function to check for low stock alerts
async function checkLowStockAlerts(supabase: any, results: any[]) {
  const alerts: any[] = []
  
  // Get all affected ingredients
  const ingredientIds = results.flatMap(r => 
    r.inventory_updates?.map((u: any) => u.ingredient_id) || []
  )
  
  if (ingredientIds.length === 0) return alerts
  
  const { data: ingredients } = await supabase
    .from('ingredients')
    .select('*')
    .in('id', ingredientIds)
  
  if (!ingredients) return alerts
  
  for (const ingredient of ingredients) {
    if (ingredient.stock <= ingredient.min_stock) {
      alerts.push({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        current_stock: ingredient.stock,
        min_stock: ingredient.min_stock,
        unit: ingredient.unit,
        severity: ingredient.stock <= ingredient.min_stock * 0.5 ? 'critical' : 'warning',
        message: ingredient.stock <= ingredient.min_stock * 0.5
          ? `KRITIS: ${ingredient.name} hanya tersisa ${ingredient.stock} ${ingredient.unit}`
          : `PERINGATAN: ${ingredient.name} mendekati minimum stock (${ingredient.stock}/${ingredient.min_stock} ${ingredient.unit})`
      })
    }
  }
  
  return alerts
}

// GET /api/inventory/auto-update - Get inventory update logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(value)
    const offset = parseInt(value)
    
    const supabase = createServerSupabaseAdmin()
    
    const { data: transactions, error } = await (supabase as any)
      .from('stock_transactions')
      .select(`
        *,
        ingredient:ingredients (
          id,
          name,
          unit
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching stock transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch inventory logs' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      transactions: transactions || [],
      pagination: {
        limit,
        offset,
        total: transactions?.length || 0
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/inventory/auto-update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}