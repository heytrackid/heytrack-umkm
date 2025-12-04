/**
 * Financial Sync Service
 * Handles automatic financial record creation and synchronization
 * 
 * ✅ STANDARDIZED: Extends BaseService, uses ServiceContext
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'
import type { FinancialRecordInsert } from '@/types/database'

export interface SyncResult {
  orders: number
  expenses: number
  purchases: number
}

export interface FinancialRecordResult {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  category: string
  reference: string
}

export class FinancialSyncService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Create income record from delivered order
   */
  async createIncomeFromOrder(
    orderId: string,
    orderNo: string,
    amount: number,
    customerName?: string,
    orderDate?: string
  ): Promise<FinancialRecordResult | null> {
    return this.executeWithAudit(
      async () => {
        // Check if financial record already exists for this order
        const { data: existingOrder } = await this.context.supabase
          .from('orders')
          .select('financial_record_id')
          .eq('id', orderId)
          .eq('user_id', this.context.userId)
          .single()

        if (existingOrder?.financial_record_id) {
          this.logger.info({ orderId, existingRecordId: existingOrder.financial_record_id }, 'Financial record already exists for order')
          return null
        }

        const incomeData: FinancialRecordInsert = {
          user_id: this.context.userId,
          type: 'INCOME',
          category: 'Revenue',
          amount,
          date: orderDate ?? new Date().toISOString().split('T')[0] ?? null,
          reference: `Order #${orderNo}${customerName ? ` - ${customerName}` : ''}`,
          description: `Income from order ${orderNo}`,
          created_by: this.context.userId
        }

        const { data: record, error } = await this.context.supabase
          .from('financial_records')
          .insert(incomeData)
          .select('id, type, amount, category, reference')
          .single()

        if (error) {
          this.logger.error({ error, orderId }, 'Failed to create income record')
          throw error
        }

        // Link financial record to order
        await this.context.supabase
          .from('orders')
          .update({ financial_record_id: record.id })
          .eq('id', orderId)
          .eq('user_id', this.context.userId)

        this.logger.info({ orderId, recordId: record.id, amount }, 'Income record created from order')

        return record as FinancialRecordResult
      },
      'CREATE',
      'FINANCIAL_RECORD',
      undefined,
      { source: 'order', orderId, amount }
    )
  }

  /**
   * Create expense record from ingredient purchase
   */
  async createExpenseFromPurchase(
    purchaseId: string,
    ingredientName: string,
    amount: number,
    supplier?: string,
    purchaseDate?: string
  ): Promise<FinancialRecordResult | null> {
    return this.executeWithAudit(
      async () => {
        // Check if expense already linked
        const { data: existingPurchase } = await this.context.supabase
          .from('ingredient_purchases')
          .select('expense_id')
          .eq('id', purchaseId)
          .eq('user_id', this.context.userId)
          .single()

        if (existingPurchase?.expense_id) {
          this.logger.info({ purchaseId, existingExpenseId: existingPurchase.expense_id }, 'Expense record already exists for purchase')
          return null
        }

        const expenseData: FinancialRecordInsert = {
          user_id: this.context.userId,
          type: 'EXPENSE',
          category: 'Bahan Baku',
          amount,
          date: purchaseDate ?? new Date().toISOString().split('T')[0] ?? null,
          reference: `Purchase - ${ingredientName}${supplier ? ` from ${supplier}` : ''}`,
          description: `Ingredient purchase: ${ingredientName}`,
          created_by: this.context.userId
        }

        const { data: record, error } = await this.context.supabase
          .from('financial_records')
          .insert(expenseData)
          .select('id, type, amount, category, reference')
          .single()

        if (error) {
          this.logger.error({ error, purchaseId }, 'Failed to create expense record')
          throw error
        }

        // Link expense to purchase
        await this.context.supabase
          .from('ingredient_purchases')
          .update({ expense_id: record.id })
          .eq('id', purchaseId)
          .eq('user_id', this.context.userId)

        this.logger.info({ purchaseId, recordId: record.id, amount }, 'Expense record created from purchase')

        return record as FinancialRecordResult
      },
      'CREATE',
      'FINANCIAL_RECORD',
      undefined,
      { source: 'purchase', purchaseId, amount }
    )
  }

  /**
   * Reverse/delete financial record when order is cancelled
   */
  async reverseOrderIncome(orderId: string): Promise<boolean> {
    return this.executeWithAudit(
      async () => {
        const { data: order } = await this.context.supabase
          .from('orders')
          .select('financial_record_id, order_no')
          .eq('id', orderId)
          .eq('user_id', this.context.userId)
          .single()

        if (!order?.financial_record_id) {
          this.logger.info({ orderId }, 'No financial record to reverse for order')
          return false
        }

        // Delete the financial record
        const { error } = await this.context.supabase
          .from('financial_records')
          .delete()
          .eq('id', order.financial_record_id)
          .eq('user_id', this.context.userId)

        if (error) {
          this.logger.error({ error, orderId, recordId: order.financial_record_id }, 'Failed to delete financial record')
          throw error
        }

        // Unlink from order
        await this.context.supabase
          .from('orders')
          .update({ financial_record_id: null })
          .eq('id', orderId)
          .eq('user_id', this.context.userId)

        this.logger.info({ orderId, recordId: order.financial_record_id }, 'Financial record reversed for cancelled order')

        return true
      },
      'DELETE',
      'FINANCIAL_RECORD',
      undefined,
      { source: 'order_cancellation', orderId }
    )
  }

  /**
   * Auto-sync all unsynced transactions
   */
  async autoSyncAll(): Promise<SyncResult> {
    const result: SyncResult = { orders: 0, expenses: 0, purchases: 0 }

    // Sync delivered orders without financial records
    const { data: unsyncedOrders } = await this.context.supabase
      .from('orders')
      .select('id, order_no, total_amount, customer_name, delivery_date, order_date')
      .eq('user_id', this.context.userId)
      .eq('status', 'DELIVERED')
      .is('financial_record_id', null)
      .gt('total_amount', 0)

    if (unsyncedOrders) {
      for (const order of unsyncedOrders) {
        try {
          const created = await this.createIncomeFromOrder(
            order.id,
            order.order_no,
            order.total_amount ?? 0,
            order.customer_name ?? undefined,
            order.delivery_date ?? order.order_date ?? undefined
          )
          if (created) result.orders++
        } catch (err) {
          this.logger.error({ error: err, orderId: order.id }, 'Failed to sync order')
        }
      }
    }

    // Sync purchases without expense records
    const { data: unsyncedPurchases } = await this.context.supabase
      .from('ingredient_purchases')
      .select(`
        id, 
        total_price, 
        supplier, 
        purchase_date,
        ingredients:ingredient_id (name)
      `)
      .eq('user_id', this.context.userId)
      .is('expense_id', null)
      .gt('total_price', 0)

    if (unsyncedPurchases) {
      for (const purchase of unsyncedPurchases) {
        try {
          const ingredientData = purchase.ingredients as { name: string } | null
          const created = await this.createExpenseFromPurchase(
            purchase.id,
            ingredientData?.name ?? 'Unknown Ingredient',
            purchase.total_price ?? 0,
            purchase.supplier ?? undefined,
            purchase.purchase_date ?? undefined
          )
          if (created) result.purchases++
        } catch (err) {
          this.logger.error({ error: err, purchaseId: purchase.id }, 'Failed to sync purchase')
        }
      }
    }

    this.logger.info(result, 'Auto-sync completed')

    return result
  }
}
