import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { IngredientPurchaseInsertSchema } from '@/lib/validations/database-validations'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert } from '@/types/database'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'
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
            .eq('user_id', user.id)
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

        // ✅ V2: Validate array structure (optional but recommended for debugging)
        if (purchases && !Array.isArray(purchases)) {
            apiLogger.error({ purchases }, 'Invalid purchases data structure')
            return NextResponse.json(
                { error: 'Invalid data structure' },
                { status: 500 }
            )
        }

        return NextResponse.json(purchases || [])
    } catch (error: unknown) {
        apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/ingredient-purchases:')
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
        }        const body = await request.json()

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
            .select('id, name, unit, current_stock, price_per_unit, user_id')
            .eq('id', validatedData.ingredient_id)
            .eq('user_id', user.id)
            .single()

        if (ingredientError || !ingredient) {
            return NextResponse.json(
                { error: 'Ingredient not found' },
                { status: 404 }
            )
        }

        // Type-safe ingredient data
        type _IngredientRow = typeof ingredient
        const ingredientData = ingredient

        // 1. Create financial transaction (expense)
        let financialTransactionId: string | null = null
        const financialRecord: Insert<'financial_records'> = {
            user_id: user.id,
            type: 'EXPENSE',
            category: 'Pembelian Bahan Baku',
            amount: totalHarga,
            description: `Pembelian: ${ingredientData.name} (${qtyBeli} ${ingredientData.unit}) dari ${validatedData.supplier ?? 'Supplier'}`,
            date: validatedData.purchase_date ?? new Date().toISOString().split('T')[0]
        }
        
        const { data: transaction, error: transactionError } = await supabase
            .from('financial_records')
            .insert(financialRecord)
            .select('id')
            .single()

        if (transactionError) {
            apiLogger.error({ error: transactionError }, 'Error creating financial transaction:')
            // Continue without financial transaction
        } else {
            financialTransactionId = transaction?.id || null
        }

        // 2. Create purchase record
        const purchaseRecord: Insert<'ingredient_purchases'> = {
            user_id: user.id,
            ingredient_id: validatedData.ingredient_id,
            supplier: validatedData.supplier,
            quantity: qtyBeli,
            unit_price: hargaSatuan,
            total_price: totalHarga,
            purchase_date: validatedData.purchase_date ?? new Date().toISOString().split('T')[0],
            notes: validatedData.notes
        }
        
        const { data: purchase, error: purchaseError } = await supabase
            .from('ingredient_purchases')
            .insert(purchaseRecord)
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

        // 3. Update ingredient stock (atomic operation to prevent race condition)
        // TODO: Create PostgreSQL function for atomic increment
        // For now, use optimistic locking with current_stock check
        const newStock = (ingredientData.current_stock ?? 0) + qtyBeli

        const stockUpdate = {
            current_stock: newStock
        }

        const { error: stockError } = await supabase
            .from('ingredients')
            .update(stockUpdate)
            .eq('id', validatedData.ingredient_id)
            .eq('user_id', user.id)
            // Add optimistic lock: only update if current_stock hasn't changed
            .eq('current_stock', ingredientData.current_stock ?? 0)

        if (stockError) {
            apiLogger.error({ error: stockError }, 'Error updating stock (possible race condition):')
            // Note: Purchase is already created, stock update failed
            // Consider implementing retry logic or queue-based updates
        }

        // 4. Create stock ledger entry
        const stockLog: Insert<'inventory_stock_logs'> = {
            ingredient_id: validatedData.ingredient_id,
            quantity_before: ingredientData.current_stock ?? 0,
            quantity_after: newStock,
            quantity_changed: qtyBeli,
            change_type: 'increase',
            reference_id: purchase?.id || null,
            reference_type: 'ingredient_purchase'
        }
        
        await supabase
            .from('inventory_stock_logs')
            .insert(stockLog)
            .select()

        return NextResponse.json(purchase, { status: 201 })
    } catch (error: unknown) {
        apiLogger.error({ error: getErrorMessage(error) }, 'Error in POST /api/ingredient-purchases:')
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE moved to /api/ingredient-purchases/[id]/route.ts
