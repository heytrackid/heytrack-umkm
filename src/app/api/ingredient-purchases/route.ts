import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { IngredientPurchaseInsertSchema } from '@/lib/validations/database-validations'

import { apiLogger } from '@/lib/logger'
/**
 * GET /api/ingredient-purchases
 * List all ingredient purchases with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Validate session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get query parameters
        const {searchParams} = request.nextUrl
        const ingredientId = searchParams.get('ingredient_id')
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')
        const supplier = searchParams.get('supplier')

        // Build query
        let query = supabase
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
            .eq('user_id', (user as any).id)
            .order('purchase_date', { ascending: false })

        // Apply filters
        if (ingredientId) {
            query = query.eq('ingredient_id', ingredientId)
        }

        if (startDate) {
            query = query.gte('purchase_date', startDate)
        }

        if (endDate) {
            query = query.lte('purchase_date', endDate)
        }

        if (supplier) {
            query = query.ilike('supplier', `%${supplier}%`)
        }

        const { data: purchases, error } = await query

        if (error) {
            apiLogger.error({ error }, 'Error fetching purchases:')
            return NextResponse.json(
                { error: 'Failed to fetch purchases' },
                { status: 500 }
            )
        }

        return NextResponse.json(purchases)
    } catch (err: unknown) {
        apiLogger.error({ err }, 'Error in GET /api/ingredient-purchases:')
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/ingredient-purchases
 * Create new ingredient purchase and update stock
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Validate session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Validate request body with Zod
        const validation = IngredientPurchaseInsertSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    details: validation.error.issues
                },
                { status: 400 }
            )
        }

        const validatedData = validation.data

        const qtyBeli = validatedData.quantity
        const hargaSatuan = validatedData.unit_price
        const totalHarga = qtyBeli * hargaSatuan

        // Get ingredient info
    const { data: ingredient, error: ingredientError } = await supabase
            .from('ingredients')
            .select('*')
            .eq('id', validatedData.ingredient_id)
            .eq('user_id', (user as any).id)
            .single()

        if (ingredientError || !ingredient) {
            return NextResponse.json(
                { error: 'Ingredient not found' },
                { status: 404 }
            )
        }

        // 1. Create financial transaction (expense)
        let financialTransactionId = null
        const { data: transaction, error: transactionError } = await supabase
            .from('financial_records')
            .insert({
                user_id: (user as any).id,
                type: 'EXPENSE',
                category: 'Pembelian Bahan Baku',
                amount: totalHarga,
                date: validatedData.purchase_date || new Date().toISOString().split('T')[0],
                reference: `Pembelian: ${ingredient.name} (${qtyBeli} ${ingredient.unit}) dari ${validatedData.supplier || 'Supplier'}`
            })
            .select('id')
            .single()

        if (transactionError) {
            apiLogger.error({ error: transactionError }, 'Error creating financial transaction:')
            // Continue without financial transaction
        } else {
            financialTransactionId = (transaction as any).id
        }

        // 2. Create purchase record
        const { data: purchase, error: purchaseError } = await supabase
            .from('ingredient_purchases')
            .insert({
                user_id: (user as any).id,
                ingredient_id: validatedData.ingredient_id,
                supplier: validatedData.supplier,
                quantity: qtyBeli,
                unit_price: hargaSatuan,
                total_price: totalHarga,
                purchase_date: validatedData.purchase_date || new Date().toISOString().split('T')[0],
                notes: validatedData.notes
            })
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

        if (purchaseError) {
            apiLogger.error({ error: purchaseError }, 'Error creating purchase:')

            // Rollback financial transaction if purchase fails
            if (financialTransactionId) {
                await supabase
                    .from('financial_records')
                    .delete()
                    .eq('id', financialTransactionId)
            }

            return NextResponse.json(
                { error: 'Failed to create purchase' },
                { status: 500 }
            )
        }

        // 3. Update ingredient stock
        const newStock = (ingredient.current_stock || 0) + qtyBeli

        const { error: stockError } = await supabase
            .from('ingredients')
            .update({ current_stock: newStock } as any)
            .eq('id', validatedData.ingredient_id)
            .eq('user_id', (user as any).id)

        if (stockError) {
            apiLogger.error({ error: stockError }, 'Error updating stock:')
            // Note: Purchase is already created, just log the error
        }

        // 4. Create stock ledger entry
        await supabase
            .from('inventory_stock_logs')
            .insert({
                user_id: (user as any).id,
                ingredient_id: validatedData.ingredient_id,
                quantity_before: ingredient.current_stock || 0,
                quantity_after: newStock,
                quantity_changed: qtyBeli,
                change_type: 'PURCHASE',
                reference_id: (purchase).id,
                reference_type: 'ingredient_purchase',
                transaction_date: validatedData.purchase_date || new Date().toISOString().split('T')[0]
            })

        return NextResponse.json(purchase, { status: 201 })
    } catch (err: unknown) {
        apiLogger.error({ err }, 'Error in POST /api/ingredient-purchases:')
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/ingredient-purchases?id={id}
 * Delete purchase and revert stock
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Validate session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const {searchParams} = request.nextUrl
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Purchase ID is required' },
                { status: 400 }
            )
        }

        // Get purchase details
        const { data: purchase, error: fetchError } = await supabase
            .from('ingredient_purchases')
            .select('*')
            .eq('id', id)
            .eq('user_id', (user as any).id)
            .single()

        if (fetchError || !purchase) {
            return NextResponse.json(
                { error: 'Purchase not found' },
                { status: 404 }
            )
        }

        // 1. Revert stock
        const { data: ingredient } = await supabase
            .from('ingredients')
            .select('current_stock')
            .eq('id', purchase.ingredient_id)
            .eq('user_id', (user as any).id)
            .single()

        if (ingredient) {
            const newStock = Math.max(0, (ingredient.current_stock || 0) - purchase.quantity)

            await supabase
                .from('ingredients')
                .update({ current_stock: newStock } as any)
                .eq('id', purchase.ingredient_id)
                .eq('user_id', (user as any).id)
        }

        // 2. Create stock ledger entry for reversal
        await supabase
            .from('inventory_stock_logs')
            .insert({
                user_id: (user as any).id,
                ingredient_id: purchase.ingredient_id,
                quantity_before: ingredient?.current_stock || 0,
                quantity_after: ingredient ? Math.max(0, (ingredient.current_stock || 0) - purchase.quantity) : 0,
                quantity_changed: -purchase.quantity,
                change_type: 'ADJUSTMENT',
                reason: 'Purchase deletion',
                reference_id: purchase.id,
                reference_type: 'ingredient_purchase',
                transaction_date: new Date().toISOString().split('T')[0]
            })

        // 3. Delete purchase
        const { error: deleteError } = await supabase
            .from('ingredient_purchases')
            .delete()
            .eq('id', id)
            .eq('user_id', (user as any).id)

        if (deleteError) {
            apiLogger.error({ error: deleteError }, 'Error deleting purchase:')
            return NextResponse.json(
                { error: 'Failed to delete purchase' },
                { status: 500 }
            )
        }

        // 4. Delete associated financial transaction (optional)
        // Note: We don't have a direct reference, so we'll skip this for now
        // In a production system, you might want to add a reference field

        return NextResponse.json({ message: 'Purchase deleted successfully' })
    } catch (err: unknown) {
        apiLogger.error({ err }, 'Error in DELETE /api/ingredient-purchases:')
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
