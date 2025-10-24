import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
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
        const searchParams = request.nextUrl.searchParams
        const bahanId = searchParams.get('bahan_id')
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')
        const supplier = searchParams.get('supplier')

        // Build query
        let query = supabase
            .from('bahan_baku_pembelian')
            .select(`
        *,
        bahan:bahan_baku (
          id,
          nama_bahan,
          satuan,
          stok_tersedia,
          harga_per_satuan
        )
      `)
            .eq('user_id', user.id)
            .order('tanggal_beli', { ascending: false })

        // Apply filters
        if (bahanId) {
            query = query.eq('bahan_id', bahanId)
        }

        if (startDate) {
            query = query.gte('tanggal_beli', startDate)
        }

        if (endDate) {
            query = query.lte('tanggal_beli', endDate)
        }

        if (supplier) {
            query = query.ilike('supplier', `%${supplier}%`)
        }

        const { data: purchases, error } = await query

        if (error) {
            apiLogger.error({ error: error }, 'Error fetching purchases:')
            return NextResponse.json(
                { error: 'Failed to fetch purchases' },
                { status: 500 }
            )
        }

        return NextResponse.json(purchases)
    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in GET /api/ingredient-purchases:')
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

        const qtyBeli = validatedData.qty_beli
        const hargaSatuan = validatedData.harga_satuan
        const totalHarga = qtyBeli * hargaSatuan

        // Get ingredient info
        const { data: bahan, error: bahanError } = await supabase
            .from('bahan_baku')
            .select('*')
            .eq('id', validatedData.bahan_id)
            .eq('user_id', user.id)
            .single()

        if (bahanError || !bahan) {
            return NextResponse.json(
                { error: 'Ingredient not found' },
                { status: 404 }
            )
        }

        // 1. Create financial transaction (expense)
        let financialTransactionId = null
        const { data: transaction, error: transactionError } = await supabase
            .from('financial_transactions')
            .insert({
                user_id: user.id,
                jenis: 'pengeluaran',
                kategori: 'Pembelian Bahan Baku',
                nominal: totalHarga,
                tanggal: validatedData.tanggal_beli || new Date().toISOString().split('T')[0],
                referensi: `Pembelian: ${bahan.nama_bahan} (${qtyBeli} ${bahan.satuan}) dari ${validatedData.supplier || 'Supplier'}`
            })
            .select('id')
            .single()

        if (transactionError) {
            apiLogger.error({ error: transactionError }, 'Error creating financial transaction:')
            // Continue without financial transaction
        } else {
            financialTransactionId = transaction.id
        }

        // 2. Create purchase record
        const { data: purchase, error: purchaseError } = await supabase
            .from('bahan_baku_pembelian')
            .insert({
                user_id: user.id,
                bahan_id: validatedData.bahan_id,
                supplier: validatedData.supplier,
                qty_beli: qtyBeli,
                harga_satuan: hargaSatuan,
                total_harga: totalHarga,
                tanggal_beli: validatedData.tanggal_beli || new Date().toISOString().split('T')[0],
                catatan: validatedData.catatan
            })
            .select(`
        *,
        bahan:bahan_baku (
          id,
          nama_bahan,
          satuan,
          stok_tersedia,
          harga_per_satuan
        )
      `)
            .single()

        if (purchaseError) {
            apiLogger.error({ error: purchaseError }, 'Error creating purchase:')

            // Rollback financial transaction if purchase fails
            if (financialTransactionId) {
                await supabase
                    .from('financial_transactions')
                    .delete()
                    .eq('id', financialTransactionId)
            }

            return NextResponse.json(
                { error: 'Failed to create purchase' },
                { status: 500 }
            )
        }

        // 3. Update ingredient stock
        const newStock = (bahan.stok_tersedia || 0) + qtyBeli

        const { error: stockError } = await supabase
            .from('bahan_baku')
            .update({ stok_tersedia: newStock })
            .eq('id', validatedData.bahan_id)
            .eq('user_id', user.id)

        if (stockError) {
            apiLogger.error({ error: stockError }, 'Error updating stock:')
            // Note: Purchase is already created, just log the error
        }

        // 4. Create stock ledger entry
        await supabase
            .from('stock_ledger')
            .insert({
                user_id: user.id,
                bahan_id: validatedData.bahan_id,
                qty: qtyBeli,
                tipe: 'in',
                ref: `Purchase #${purchase.id.substring(0, 8)}`
            })

        return NextResponse.json(purchase, { status: 201 })
    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in POST /api/ingredient-purchases:')
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

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Purchase ID is required' },
                { status: 400 }
            )
        }

        // Get purchase details
        const { data: purchase, error: fetchError } = await supabase
            .from('bahan_baku_pembelian')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !purchase) {
            return NextResponse.json(
                { error: 'Purchase not found' },
                { status: 404 }
            )
        }

        // 1. Revert stock
        const { data: bahan } = await supabase
            .from('bahan_baku')
            .select('stok_tersedia')
            .eq('id', purchase.bahan_id)
            .eq('user_id', user.id)
            .single()

        if (bahan) {
            const newStock = Math.max(0, (bahan.stok_tersedia || 0) - purchase.qty_beli)

            await supabase
                .from('bahan_baku')
                .update({ stok_tersedia: newStock })
                .eq('id', purchase.bahan_id)
                .eq('user_id', user.id)
        }

        // 2. Create stock ledger entry for reversal
        await supabase
            .from('stock_ledger')
            .insert({
                user_id: user.id,
                bahan_id: purchase.bahan_id,
                qty: purchase.qty_beli,
                tipe: 'out',
                ref: `Reversal: Purchase #${purchase.id.substring(0, 8)}`
            })

        // 3. Delete purchase
        const { error: deleteError } = await supabase
            .from('bahan_baku_pembelian')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

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
    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in DELETE /api/ingredient-purchases:')
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
