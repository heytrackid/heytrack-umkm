// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { cacheInvalidation } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'

import type { Insert, OrderStatus } from '@/types/database'


type CustomerInsert = Insert<'customers'>
type OrderInsert = Insert<'orders'>
type OrderItemInsert = Omit<Insert<'order_items'>, 'order_id'>

const sanitizeOptionalString = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

interface RawImportedOrder {
  order_no?: string | null
  customer_name?: string | null
  recipe_name?: string | null
  quantity?: number | string | null
  unit_price?: number | string | null
  customer_phone?: string | null
  customer_email?: string | null
  customer_address?: string | null
  status?: string | null
  delivery_date?: string | null
  notes?: string | null
}

interface ImportOrdersRequest {
  orders?: RawImportedOrder[]
}

const isRawImportedOrder = (value: unknown): value is RawImportedOrder =>
  typeof value === 'object' && value !== null

const isImportOrdersRequest = (value: unknown): value is ImportOrdersRequest => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  const { orders } = record
  if (!Array.isArray(orders)) {
    return false
  }
  return orders.every(isRawImportedOrder)
}

async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    // 2. Parse CSV data from request
    const body = await request.json() as unknown

    if (!isImportOrdersRequest(body) || !body.orders || body.orders.length === 0) {
      return NextResponse.json(
        { error: 'Data pesanan tidak valid' },
        { status: 400 }
      )
    }
    const { orders } = body

    // 3. Get all recipes for mapping
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name')
      .eq('user_id', user['id'])

    if (recipesError) {
      apiLogger.error({ error: recipesError }, 'Failed to fetch recipes')
      return NextResponse.json(
        { error: 'Gagal memuat data resep' },
        { status: 500 }
      )
    }

    const recipeMap = new Map(recipes.map(r => [r.name.toLowerCase(), r['id']]))

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
      if (!order) {continue}
      const rowNum = index + 2

      // Validate required fields
      if (!order['order_no']?.trim()) {
        errors.push({ row: rowNum, error: 'Nomor pesanan wajib diisi' })
        continue
      }

      if (!order['customer_name']?.trim()) {
        errors.push({ row: rowNum, error: 'Nama customer wajib diisi' })
        continue
      }

      if (!order['recipe_name']?.trim()) {
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
      const recipeId = recipeMap.get(order['recipe_name'].toLowerCase())
      if (!recipeId) {
        errors.push({ row: rowNum, error: `Resep "${order['recipe_name']}" tidak ditemukan` })
        continue
      }

      // Prepare customer data (will be created if not exists)
      const customerKey = order['customer_name'].toLowerCase().trim()
      if (!customersToCreate.has(customerKey)) {
        customersToCreate.set(customerKey, {
          name: order['customer_name'].trim(),
          phone: sanitizeOptionalString(order.customer_phone),
          email: sanitizeOptionalString(order.customer_email),
          address: sanitizeOptionalString(order.customer_address),
          user_id: user['id'],
          is_active: true
        })
      }

      // Prepare order data
      const totalPrice = quantity * unitPrice
      ordersToCreate.push({
        order: {
          order_no: order['order_no'].trim(),
          customer_name: order['customer_name'].trim(),
          customer_phone: sanitizeOptionalString(order.customer_phone),
          customer_address: sanitizeOptionalString(order.customer_address),
          status: (order['status'] ? order['status'].toUpperCase() : 'PENDING') as OrderStatus,
          total_amount: totalPrice,
          delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString() : null,
          notes: sanitizeOptionalString(order.notes),
          user_id: user['id']
        },
        items: [{
          recipe_id: recipeId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          product_name: order['recipe_name'].trim(),
          user_id: user['id']
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

    const customerPromises = Array.from(customersToCreate.entries()).map(async ([customerKey, customerData]) => {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user['id'])
        .ilike('name', customerData.name)
        .maybeSingle()

      if (existingCustomer) {
        customerIds.set(customerKey, existingCustomer['id'])
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert(customerData)
          .select('id')
          .single()

        if (customerError) {
          apiLogger.error({ error: customerError }, 'Failed to create customer')
          throw new Error(`Gagal membuat customer: ${customerData.name}`)
        }

        customerIds.set(customerKey, newCustomer['id'])
      }
    })

    try {
      await Promise.all(customerPromises)
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      )
    }

    // 6. Create orders with items
    const createdOrders = []

    const orderPromises = ordersToCreate.map(async (orderData) => {
      const customerId = customerIds.get(orderData.customerName)

      // Create order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData.order,
          customer_id: customerId ?? null
        })
        .select()
        .single()

      if (orderError) {
        apiLogger.error({ error: orderError }, 'Failed to create order')
        return null
      }

      // Create order items
      const itemsWithOrderId = orderData.items.map(item => ({
        ...item,
        order_id: newOrder['id']
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)

      if (itemsError) {
        apiLogger.error({ error: itemsError }, 'Failed to create order items')
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', newOrder['id'])
        return null
      }

      return newOrder
    })

    const orderResults = await Promise.all(orderPromises)
    createdOrders.push(...orderResults.filter(order => order !== null))

    apiLogger.info(
      {
        userId: user['id'],
        ordersCount: createdOrders.length,
        customersCount: customerIds.size
      },
      'Orders imported successfully'
    )

    // Invalidate cache after bulk import
    cacheInvalidation.orders()
    cacheInvalidation.customers()

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
