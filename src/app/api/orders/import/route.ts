// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { cacheInvalidation } from '@/lib/cache'
import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ORDER_FIELDS } from '@/lib/database/query-fields'
import type { Database, Insert, OrderStatus, Row } from '@/types/database'
import { InputSanitizer, SecurityPresets, createSecureHandler } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

type OrderRow = Row<'orders'>




type CustomerInsert = Insert<'customers'>
type OrderInsert = Insert<'orders'>
type OrderItemInsert = Omit<Insert<'order_items'>, 'order_id'>

const ORDER_STATUS_VALUES: readonly OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'READY',
  'DELIVERED',
  'CANCELLED'
]

const requiredText = (max = 200) =>
  z.string()
    .trim()
    .min(1)
    .max(max)
    .transform(value => InputSanitizer.sanitizeHtml(value).trim().slice(0, max))

const optionalText = (max = 200, options?: { lowercase?: boolean }) =>
  z.union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value !== 'string') {return undefined}
      let sanitized = InputSanitizer.sanitizeHtml(value).trim()
      if (!sanitized) {return undefined}
      sanitized = sanitized.slice(0, max)
      return options?.lowercase ? sanitized.toLowerCase() : sanitized
    })

const parseNumberFromInput = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim()
    if (!normalized) {return undefined}
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const QuantitySchema = z.preprocess(
  parseNumberFromInput,
  z.number().positive({ message: 'Jumlah harus lebih dari 0' })
)

const UnitPriceSchema = z.preprocess(
  parseNumberFromInput,
  z.number().min(0, { message: 'Harga satuan harus >= 0' })
)

const DeliveryDateSchema = z.union([z.string(), z.null(), z.undefined()]).transform((value) => {
  if (typeof value !== 'string') {return undefined}
  const trimmed = value.trim()
  if (!trimmed) {return undefined}
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
})

const StatusSchema: z.ZodType<OrderStatus> = z.union([z.string(), z.null(), z.undefined()]).transform((value) => {
  if (typeof value !== 'string') {return 'PENDING'}
  const sanitized = InputSanitizer.sanitizeSQLInput(value).trim().toUpperCase()
  return ORDER_STATUS_VALUES.includes(sanitized as OrderStatus)
    ? sanitized as OrderStatus
    : 'PENDING'
})

const ImportedOrderSchema = z.object({
  order_no: requiredText(64),
  customer_name: requiredText(120),
  recipe_name: requiredText(120),
  quantity: QuantitySchema,
  unit_price: UnitPriceSchema,
  customer_phone: optionalText(30),
  customer_email: optionalText(320, { lowercase: true }),
  customer_address: optionalText(255),
  status: StatusSchema,
  delivery_date: DeliveryDateSchema,
  notes: optionalText(500)
}).strict()

const ImportOrdersSchema = z.object({
  orders: z.array(ImportedOrderSchema).min(1, 'Minimal satu pesanan untuk import')
}).strict()

type ImportedOrder = z.infer<typeof ImportedOrderSchema>

async function authenticateUser(): Promise<{ id: string }> {
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) {
    throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
  }

  return authResult
}

async function parseAndValidateRequest(request: NextRequest): Promise<{ orders: ImportedOrder[] }> {
  const body = await request.json() as unknown
  return ImportOrdersSchema.parse(body)
}

async function fetchRecipes(supabase: SupabaseClient<Database>, userId: string): Promise<Map<string, string>> {
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, name')
    .eq('user_id', userId)

  if (recipesError) {
    apiLogger.error({ error: recipesError }, 'Failed to fetch recipes')
    throw new APIError('Gagal memuat data resep', { status: 500, code: 'RECIPES_FETCH_FAILED' })
  }

  return new Map(recipes?.map((r: { id: string; name: string }) => [r.name.toLowerCase(), r.id]) ?? [])
}

function processOrders(
  orders: ImportedOrder[],
  recipeMap: Map<string, string>,
  userId: string
): {
  errors: Array<{ row: number; error: string }>
  customersToCreate: Map<string, CustomerInsert>
  ordersToCreate: Array<{
    order: OrderInsert
    items: OrderItemInsert[]
    customerName: string
  }>
} {
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

    const recipeId = recipeMap.get(order.recipe_name.toLowerCase())
    if (!recipeId) {
      errors.push({ row: rowNum, error: `Resep "${order.recipe_name}" tidak ditemukan` })
      continue
    }

    // Prepare customer data (will be created if not exists)
    const customerKey = order.customer_name.toLowerCase()
    if (!customersToCreate.has(customerKey)) {
      customersToCreate.set(customerKey, {
        name: order.customer_name,
        phone: order.customer_phone ?? null,
        email: order.customer_email ?? null,
        address: order.customer_address ?? null,
        user_id: userId,
        is_active: true
      })
    }

    // Prepare order data
    const totalPrice = order.quantity * order.unit_price
    ordersToCreate.push({
      order: {
        order_no: order.order_no,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone ?? null,
        customer_address: order.customer_address ?? null,
        status: order.status,
        total_amount: totalPrice,
        delivery_date: order.delivery_date ?? null,
        notes: order.notes ?? null,
        user_id: userId
      },
      items: [{
        recipe_id: recipeId,
        quantity: order.quantity,
        unit_price: order.unit_price,
        total_price: totalPrice,
        product_name: order.recipe_name,
        user_id: userId
      }],
      customerName: customerKey
    })
  }

  return { errors, customersToCreate, ordersToCreate }
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const user = await authenticateUser()

    // 2. Parse and validate request
    const { orders } = await parseAndValidateRequest(request)

    // 3. Get all recipes for mapping
    const recipeMap = await fetchRecipes(supabase, user['id'])

    // 4. Process orders
    const { errors, customersToCreate, ordersToCreate } = processOrders(orders, recipeMap, user['id'])

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
          .insert(customerData as never)
          .select('id')
          .single()

        if (customerError) {
          apiLogger.error({ error: customerError }, 'Failed to create customer')
          throw new APIError(`Gagal membuat customer: ${customerData.name}`, {
            status: 500,
            code: 'CUSTOMER_CREATION_FAILED'
          })
        }

        customerIds.set(customerKey, newCustomer['id'])
      }
    })

    try {
      await Promise.all(customerPromises)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membuat customer baru'
      throw new APIError(message, { status: 500, code: 'CUSTOMER_CREATION_FAILED' })
    }

    // 6. Create orders with items
    const createdOrders: OrderRow[] = []

    const orderPromises = ordersToCreate.map(async (orderData) => {
      const customerId = customerIds.get(orderData.customerName)

      // Create order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData.order,
          customer_id: customerId ?? null
        } as never)
        .select(ORDER_FIELDS.LIST)
        .single()

      if (orderError) {
        apiLogger.error({ error: orderError }, 'Failed to create order')
        return null
      }

      const typedNewOrder = newOrder as OrderRow

      // Create order items
      const itemsWithOrderId = orderData.items.map(item => ({
        ...item,
        order_id: typedNewOrder['id']
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId as never)

      if (itemsError) {
        apiLogger.error({ error: itemsError }, 'Failed to create order items')
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', typedNewOrder['id'])
        return null
      }

      return typedNewOrder
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
      message: `Successfully imported ${createdOrders.length} orders`,
      data: createdOrders
    })
  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/orders/import')
    return handleAPIError(error, 'POST /api/orders/import')
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/orders/import', SecurityPresets.enhanced())
