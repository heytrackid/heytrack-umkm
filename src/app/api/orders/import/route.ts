import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { OrderStatus, CustomersInsert, OrdersInsert, OrderItemsInsert } from '@/types/database'
import { withSecurity, SecurityPresets } from '@/utils/security'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type CustomerInsert = CustomersInsert
type OrderInsert = OrdersInsert
type OrderItemInsert = Omit<OrderItemsInsert, 'order_id'>

async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse CSV data from request
    const body = await request.json()
    const { orders } = body as { orders: Array<{
      order_no: string
      customer_name: string
      customer_phone?: string
      customer_email?: string
      customer_address?: string
      recipe_name: string
      quantity: number
      unit_price: number
      delivery_date?: string
      notes?: string
      status?: string
    }> }

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'Data pesanan tidak valid' },
        { status: 400 }
      )
    }

    // 3. Get all recipes for mapping
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name')
      .eq('user_id', user.id)

    if (recipesError) {
      apiLogger.error({ error: recipesError }, 'Failed to fetch recipes')
      return NextResponse.json(
        { error: 'Gagal memuat data resep' },
        { status: 500 }
      )
    }

    const recipeMap = new Map(recipes.map(r => [r.name.toLowerCase(), r.id]))

    // 4. Process orders
    const errors: Array<{ row: number; error: string }> = []
    const customersToCreate = new Map<string, CustomerInsert>()
    const ordersToCreate: Array<{
      order: OrderInsert
      items: OrderItemInsert[]
      customerName: string
    }> = []

    for (let index = 0; index < orders.length; index++) {
      const order = orders[index]
      const rowNum = index + 2

      // Validate required fields
      if (!order.order_no?.trim()) {
        errors.push({ row: rowNum, error: 'Nomor pesanan wajib diisi' })
        continue
      }

      if (!order.customer_name?.trim()) {
        errors.push({ row: rowNum, error: 'Nama customer wajib diisi' })
        continue
      }

      if (!order.recipe_name?.trim()) {
        errors.push({ row: rowNum, error: 'Nama resep wajib diisi' })
        continue
      }

      const quantity = Number(order.quantity)
      if (isNaN(quantity) || quantity <= 0) {
        errors.push({ row: rowNum, error: 'Jumlah harus angka positif' })
        continue
      }

      const unitPrice = Number(order.unit_price)
      if (isNaN(unitPrice) || unitPrice < 0) {
        errors.push({ row: rowNum, error: 'Harga satuan harus angka positif' })
        continue
      }

      // Find recipe
      const recipeId = recipeMap.get(order.recipe_name.toLowerCase())
      if (!recipeId) {
        errors.push({ row: rowNum, error: `Resep "${order.recipe_name}" tidak ditemukan` })
        continue
      }

      // Prepare customer data (will be created if not exists)
      const customerKey = order.customer_name.toLowerCase().trim()
      if (!customersToCreate.has(customerKey)) {
        customersToCreate.set(customerKey, {
          name: order.customer_name.trim(),
          phone: order.customer_phone?.trim() || null,
          email: order.customer_email?.trim() || null,
          address: order.customer_address?.trim() || null,
          user_id: user.id,
          is_active: true
        })
      }

      // Prepare order data
      const totalPrice = quantity * unitPrice
      ordersToCreate.push({
        order: {
          order_no: order.order_no.trim(),
          customer_name: order.customer_name.trim(),
          customer_phone: order.customer_phone?.trim() || null,
          customer_address: order.customer_address?.trim() || null,
          status: (order.status ? order.status.toUpperCase() : 'PENDING') as OrderStatus,
          total_amount: totalPrice,
          delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString() : null,
          notes: order.notes?.trim() || null,
          user_id: user.id
        },
        items: [{
          recipe_id: recipeId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          product_name: order.recipe_name.trim(),
          user_id: user.id
        }],
        customerName: customerKey
      })
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: errors,
          validCount: ordersToCreate.length,
          errorCount: errors.length
        },
        { status: 400 }
      )
    }

    // 5. Create or get customers
    const customerIds = new Map<string, string>()

    for (const [customerKey, customerData] of Array.from(customersToCreate.entries())) {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', customerData.name)
        .maybeSingle()

      if (existingCustomer) {
        customerIds.set(customerKey, existingCustomer.id)
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert(customerData)
          .select('id')
          .single()

        if (customerError) {
          apiLogger.error({ error: customerError }, 'Failed to create customer')
          return NextResponse.json(
            { error: `Gagal membuat customer: ${customerData.name}` },
            { status: 500 }
          )
        }

        customerIds.set(customerKey, newCustomer.id)
      }
    }

    // 6. Create orders with items
    const createdOrders = []

    for (const orderData of ordersToCreate) {
      const customerId = customerIds.get(orderData.customerName)

      // Create order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData.order,
          customer_id: customerId || null
        })
        .select()
        .single()

      if (orderError) {
        apiLogger.error({ error: orderError }, 'Failed to create order')
        continue
      }

      // Create order items
      const itemsWithOrderId = orderData.items.map(item => ({
        ...item,
        order_id: newOrder.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)

      if (itemsError) {
        apiLogger.error({ error: itemsError }, 'Failed to create order items')
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', newOrder.id)
        continue
      }

      createdOrders.push(newOrder)
    }

    apiLogger.info(
      {
        userId: user.id,
        ordersCount: createdOrders.length,
        customersCount: customerIds.size
      },
      'Orders imported successfully'
    )

    // Invalidate cache after bulk import
    await cacheInvalidation.orders()
    await cacheInvalidation.customers()

    return NextResponse.json({
      success: true,
      ordersCount: createdOrders.length,
      customersCount: customerIds.size,
      data: createdOrders
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/orders/import')
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat import' },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handler
export { securedPOST as POST }
