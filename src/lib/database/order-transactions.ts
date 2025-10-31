/**
 * Order Transaction Helpers
 * 
 * Provides transaction-safe order creation with proper rollback
 */

import { dbLogger } from '@/lib/logger'
import { executeTransaction, createOperation } from './transactions'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, OrdersInsert, OrderItemsInsert, FinancialRecordsInsert } from '@/types/database'

type OrderInsert = OrdersInsert
type OrderItemInsert = OrderItemsInsert
type FinancialRecordInsert = FinancialRecordsInsert

export interface OrderCreationData {
  order: OrderInsert
  items: OrderItemInsert[]
  createFinancialRecord?: boolean
}

export interface OrderCreationResult {
  orderId: string
  orderItemIds: string[]
  financialRecordId?: string
}

/**
 * Create order with transaction support
 */
export async function createOrderWithTransaction(
  supabase: SupabaseClient<Database>,
  data: OrderCreationData,
  userId: string
): Promise<OrderCreationResult> {
  let orderId: string | undefined
  let orderItemIds: string[] = []
  let financialRecordId: string | undefined

  const operations = [
    // Operation 1: Create order
    createOperation(
      'create_order',
      async () => {
        const { data: order, error } = await supabase
          .from('orders')
          .insert({ ...data.order, user_id: userId })
          .select('id')
          .single()

        if (error) {throw error}
        if (!order) {throw new Error('Order creation returned no data')}

        orderId = order.id
        dbLogger.info({ orderId }, 'Order created')
        return order
      },
      // Rollback: Delete order
      async () => {
        if (orderId) {
          await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)
            .eq('user_id', userId)
          dbLogger.info({ orderId }, 'Order rolled back')
        }
      }
    ),

    // Operation 2: Create order items
    createOperation(
      'create_order_items',
      async () => {
        if (!orderId) {throw new Error('Order ID not available')}

        const itemsWithOrderId = data.items.map(item => ({
          recipe_id: item.recipe_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_requests: item.special_requests,
          order_id: orderId,
          user_id: userId,
        }))

        const { data: items, error } = await supabase
          .from('order_items')
          .insert(itemsWithOrderId)
          .select('id')

        if (error) {throw error}
        if (!items) {throw new Error('Order items creation returned no data')}

        orderItemIds = items.map(item => item.id)
        dbLogger.info({ orderId, itemCount: items.length }, 'Order items created')
        return items
      },
      // Rollback: Delete order items
      async () => {
        if (orderItemIds.length > 0) {
          await supabase
            .from('order_items')
            .delete()
            .in('id', orderItemIds)
          dbLogger.info({ orderItemIds }, 'Order items rolled back')
        }
      }
    ),

    // Operation 3: Create financial record (optional)
    createOperation(
      'create_financial_record',
      async () => {
        if (!data.createFinancialRecord || !orderId) {return null}

        const financialRecord: FinancialRecordInsert = {
          user_id: userId,
          type: 'INCOME',
          category: 'SALES',
          amount: data.order.total_amount || 0,
          date: data.order.order_date || new Date().toISOString(),
          reference: `Order ${orderId}`,
          description: `Income from order ${data.order.order_no}`,
        }

        const { data: record, error } = await supabase
          .from('financial_records')
          .insert(financialRecord)
          .select('id')
          .single()

        if (error) {throw error}
        if (!record) {throw new Error('Financial record creation returned no data')}

        financialRecordId = record.id
        dbLogger.info({ orderId, financialRecordId }, 'Financial record created')
        return record
      },
      // Rollback: Delete financial record
      async () => {
        if (financialRecordId) {
          await supabase
            .from('financial_records')
            .delete()
            .eq('id', financialRecordId)
            .eq('user_id', userId)
          dbLogger.info({ financialRecordId }, 'Financial record rolled back')
        }
      }
    ),
  ]

  const result = await executeTransaction(operations, { logProgress: true })

  if (!result.success) {
    throw result.error || new Error('Transaction failed')
  }

  if (!orderId) {
    throw new Error('Order ID not set after transaction')
  }

  return {
    orderId,
    orderItemIds,
    financialRecordId,
  }
}
