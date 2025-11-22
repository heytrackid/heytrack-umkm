import { ERROR_MESSAGES } from '@/lib/constants/messages'
import { APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { BaseService } from '@/services/base'
import type { Insert, OrderStatus, Row } from '@/types/database'

type OrderRow = Row<'orders'>
type CustomerInsert = Insert<'customers'>
type OrderInsert = Insert<'orders'>
type OrderItemInsert = Omit<Insert<'order_items'>, 'order_id'>

export interface ImportedOrder {
  order_no: string
  customer_name: string
  recipe_name: string
  quantity: number
  unit_price: number
  customer_phone?: string | undefined
  customer_email?: string | undefined
  customer_address?: string | undefined
  status: string
  delivery_date?: string | undefined
  notes?: string | undefined
}

export interface OrderProcessingResult {
  errors: Array<{ row: number; error: string }>
  customersToCreate: Map<string, CustomerInsert>
  ordersToCreate: Array<{
    order: OrderInsert
    items: OrderItemInsert[]
    customerName: string
  }>
}

export class OrderImportService extends BaseService {
  constructor(context: import('@/services/base').ServiceContext) {
    super(context)
  }

  async fetchRecipes(): Promise<Map<string, string>> {
    const { data: recipes, error: recipesError } = await this.context.supabase
      .from('recipes')
      .select('id, name')
      .eq('user_id', this.context.userId)

    if (recipesError) {
      apiLogger.error({ error: recipesError }, 'Failed to fetch recipes')
      throw new APIError(ERROR_MESSAGES.RECIPES_FETCH_FAILED, { status: 500, code: 'RECIPES_FETCH_FAILED' })
    }

    return new Map(recipes?.map((r: { id: string; name: string }) => [r.name.toLowerCase(), r.id]) ?? [])
  }

  processOrders(
    orders: ImportedOrder[],
    recipeMap: Map<string, string>
  ): OrderProcessingResult {
    const userId = this.context.userId
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
        errors.push({ row: rowNum, error: `${ERROR_MESSAGES.RECIPE_NOT_FOUND_IN_IMPORT}: "${order.recipe_name}"` })
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
          status: order.status as OrderStatus,
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

  async createCustomersAndOrders(
    customersToCreate: Map<string, CustomerInsert>,
    ordersToCreate: Array<{
      order: OrderInsert
      items: OrderItemInsert[]
      customerName: string
    }>,
    userId: string
  ): Promise<OrderRow[]> {
    const customerIds = new Map<string, string>()

    // Create customers
    const customerPromises = Array.from(customersToCreate.entries()).map(async ([customerKey, customerData]) => {
      // Check if customer exists
      const { data: existingCustomer } = await this.context.supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', customerData.name)
        .maybeSingle()

      if (existingCustomer) {
        customerIds.set(customerKey, existingCustomer.id)
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await this.context.supabase
          .from('customers')
          .insert(customerData as never)
          .select('id')
          .single()

        if (customerError) {
          apiLogger.error({ error: customerError }, 'Failed to create customer')
          throw new APIError(`${ERROR_MESSAGES.CUSTOMER_CREATE_FAILED_IN_IMPORT}: ${customerData.name}`, {
            status: 500,
            code: 'CUSTOMER_CREATION_FAILED'
          })
        }

        customerIds.set(customerKey, newCustomer.id)
      }
    })

    try {
      await Promise.all(customerPromises)
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.CUSTOMER_CREATE_FAILED_IN_IMPORT
      throw new APIError(message, { status: 500, code: 'CUSTOMER_CREATION_FAILED' })
    }

    // Create orders with items
    const createdOrders: OrderRow[] = []

    const orderPromises = ordersToCreate.map(async (orderData) => {
      const customerId = customerIds.get(orderData.customerName)

      // Create order
      const { data: newOrder, error: orderError } = await this.context.supabase
        .from('orders')
        .insert({
          ...orderData.order,
          customer_id: customerId ?? null
        } as never)
        .select('id, created_at, created_by, customer_address, customer_id, customer_name, customer_phone, delivery_date, delivery_fee, delivery_time, discount, estimated_production_time, financial_record_id, notes, order_date, order_no, paid_amount, payment_method, payment_status, priority, production_batch_id, production_priority, special_instructions, status, tax_amount, total_amount, updated_at, updated_by, user_id')
        .single()

      if (orderError) {
        apiLogger.error({ error: orderError }, 'Failed to create order')
        return null
      }

      const typedNewOrder = newOrder as OrderRow

      // Create order items
      const itemsWithOrderId = orderData.items.map(item => ({
        ...item,
        order_id: typedNewOrder.id
      }))

      const { error: itemsError } = await this.context.supabase
        .from('order_items')
        .insert(itemsWithOrderId as never)

      if (itemsError) {
        apiLogger.error({ error: itemsError }, 'Failed to create order items')
        // Rollback: delete the order
        await this.context.supabase.from('orders').delete().eq('id', typedNewOrder.id)
        return null
      }

      return typedNewOrder
    })

    const orderResults = await Promise.all(orderPromises)
    createdOrders.push(...orderResults.filter(order => order !== null))

    apiLogger.info({
      userId,
      ordersCount: createdOrders.length,
      customersCount: customerIds.size
    }, 'Orders imported successfully')

    return createdOrders
  }
}