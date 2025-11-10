import { useMemo } from 'react'

import { DEFAULT_ORDERS_CONFIG, calculateOrderTotals, type OrdersModuleConfig, type OrderPriority } from '@/app/orders/config/orders.config'
import type {
  Order,
  OrderItem,
  OrderPayment,
  PaymentMethod,
  CreateOrderData,
  UpdateOrderData,
  OrderFilters,
  OrderSummary,
  OrderTotalsBreakdown,
  InvoiceData
} from '@/app/orders/types/orders.types'
import { useSupabaseQuery, useSupabaseCRUD } from '@/hooks/index'
import { formatCurrency, parseCurrencyString } from '@/lib/currency'

import type { CatchError } from '@/types/common' 

interface FinancialMetadata {
  currency?: string | null
  tax_rate?: number | null
  tax_inclusive?: boolean | null
}

const hasFinancialMetadata = (order: Order): order is FinancialMetadata & Order =>
  typeof order === 'object' &&
  order !== null &&
  ('currency' in order || 'tax_rate' in order || 'tax_inclusive' in order)

const resolveOrderCurrency = (order: Order): string => {
  if (hasFinancialMetadata(order) && typeof order.currency === 'string' && order.currency.trim().length > 0) {
    return order.currency
  }

  return DEFAULT_ORDERS_CONFIG.currency.default
}

const resolveOrderTaxRate = (order: Order): number => {
  if (hasFinancialMetadata(order) && typeof order.tax_rate === 'number') {
    return order.tax_rate
  }

  return DEFAULT_ORDERS_CONFIG.tax.default_rate
}

const resolveOrderTaxInclusive = (order: Order): boolean => {
  if (hasFinancialMetadata(order) && typeof order.tax_inclusive === 'boolean') {
    return order.tax_inclusive
  }

  return DEFAULT_ORDERS_CONFIG.tax.is_inclusive
}

const PAYMENT_METADATA_PREFIX = '[PAYMENT_META]'
const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'CASH'

interface PaymentMetadata {
  payment_method: PaymentMethod
  currency: string
  notes: string
}

const encodePaymentDescription = (metadata: PaymentMetadata): string => {
  const payload = JSON.stringify({
    payment_method: metadata.payment_method ?? DEFAULT_PAYMENT_METHOD,
    currency: metadata.currency ?? DEFAULT_ORDERS_CONFIG.currency.default,
    notes: metadata.notes?.trim() ?? ''
  })

  return `${PAYMENT_METADATA_PREFIX}${payload}`
}

const decodePaymentDescription = (description?: string | null): PaymentMetadata => {
  if (!description) {
    return {
      payment_method: DEFAULT_PAYMENT_METHOD,
      currency: DEFAULT_ORDERS_CONFIG.currency.default,
      notes: ''
    }
  }

  if (!description.startsWith(PAYMENT_METADATA_PREFIX)) {
    return {
      payment_method: DEFAULT_PAYMENT_METHOD,
      currency: DEFAULT_ORDERS_CONFIG.currency.default,
      notes: description
    }
  }

  try {
    const parsed = JSON.parse(description.slice(PAYMENT_METADATA_PREFIX.length)) as Partial<PaymentMetadata>
    return {
      payment_method: parsed.payment_method ?? DEFAULT_PAYMENT_METHOD,
      currency: parsed.currency ?? DEFAULT_ORDERS_CONFIG.currency.default,
      notes: parsed.notes ?? ''
    }
  } catch {
    return {
      payment_method: DEFAULT_PAYMENT_METHOD,
      currency: DEFAULT_ORDERS_CONFIG.currency.default,
      notes: description
    }
  }
}

// Main orders hook
export function useOrders(filters?: OrderFilters) {
  // Use useSupabaseQuery for fetching data
  const {
    data: ordersData,
    loading: queryLoading,
    error: queryError,
    refetch
  } = useSupabaseQuery('orders', {
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  })

  // Use useSupabaseCRUD for operations
  const {
    create: createRecord,
    update: updateRecord,
    remove: deleteRecord,
    loading: crudLoading,
    error: crudError,
    clearError
  } = useSupabaseCRUD('orders')

  // Combine loading states
  const loading = [queryLoading, crudLoading].some(Boolean)

  // Combine errors
  const error = queryError ?? crudError

  // Memoized orders data
  const orders = useMemo(() => {
    if (!ordersData) {return []}

    // Apply filters if provided
    let filteredOrders = ordersData

    if (filters) {
      const {
        status,
        payment_status: paymentStatus,
        priority,
        date_from: dateFrom,
        date_to: dateTo,
        search
      } = filters

      if (Array.isArray(status) && status.length > 0) {
        filteredOrders = filteredOrders.filter(({ status: orderStatus }) =>
          typeof orderStatus === 'string' && status.includes(orderStatus)
        )
      }

      if (paymentStatus && Array.isArray(paymentStatus) && paymentStatus.length > 0) {
        filteredOrders = filteredOrders.filter(({ payment_status: orderPaymentStatus }) =>
          typeof orderPaymentStatus === 'string' && (paymentStatus as string[]).includes(orderPaymentStatus)
        )
      }

      if (Array.isArray(priority) && priority.length > 0) {
        filteredOrders = filteredOrders.filter(({ priority: orderPriority }) =>
          typeof orderPriority === 'string' && priority.includes(orderPriority as OrderPriority)
        )
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        filteredOrders = filteredOrders.filter(({ created_at }) => {
          if (!created_at) {return false}
          return new Date(created_at) >= fromDate
        })
      }

      if (dateTo) {
        const toDate = new Date(dateTo)
        filteredOrders = filteredOrders.filter(({ created_at }) => {
          if (!created_at) {return false}
          return new Date(created_at) <= toDate
        })
      }

      if (typeof search === 'string' && search.trim().length > 0) {
        const searchLower = search.toLowerCase()
        filteredOrders = filteredOrders.filter(order => {
          const name = order['customer_name']?.toLowerCase() ?? ''
          const orderNo = order['order_no']?.toLowerCase() || ''
          return name.includes(searchLower) || orderNo.includes(searchLower)
        })
      }
    }

    return filteredOrders
  }, [ordersData, filters])

  return {
    data: orders,
    orders,
    loading,
    error,
    create: createRecord,
    update: updateRecord,
    remove: deleteRecord,
    refresh: refetch,
    clearError
  }
}

// Order items management
export function useOrderItems(orderId: string) {
  // Use useSupabaseQuery for data fetching
  const {
    data: items,
    loading,
    error,
    refetch
  } = useSupabaseQuery('order_items', {
    filter: { order_id: orderId },
    orderBy: { column: 'id', ascending: true }
  })

  // Use useSupabaseCRUD for operations
  const {
    create,
    update,
    remove: deleteItem
  } = useSupabaseCRUD('order_items')

  return {
    data: items || [],
    items: items || [],
    loading,
    error,
    create,
    update,
    remove: deleteItem,
    refresh: refetch
  }
}

// Order payments tracking (stored via financial_records table)
export function useOrderPayments(orderId?: string | null) {
  const referenceKey = orderId ? `Order ${orderId}` : null

  const {
    data,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
  } = useSupabaseCRUD('financial_records', referenceKey ? {
    strategy: 'swr',
    orderBy: { column: 'date', ascending: false },
    filter: { reference: referenceKey, type: 'INCOME', category: 'SALES' },
  } : {
    strategy: 'swr',
    orderBy: { column: 'date', ascending: false },
  })

  const payments: OrderPayment[] = useMemo(() => {
    if (!Array.isArray(data) || !orderId) {
      return []
    }

    return data.map((record) => {
      const metadata = decodePaymentDescription(record.description)

      return {
        id: record['id'],
        order_id: orderId,
        amount: record.amount,
        currency: metadata.currency ?? DEFAULT_ORDERS_CONFIG.currency.default,
        payment_method: metadata.payment_method ?? DEFAULT_PAYMENT_METHOD,
        payment_date: record.date ?? record.created_at ?? new Date().toISOString(),
        reference_number: record.reference,
        notes: metadata.notes ?? record.description ?? undefined,
        created_at: record.created_at ?? new Date().toISOString(),
      }
    })
  }, [data, orderId])

  const ensureOrderId = () => {
    if (!orderId || !referenceKey) {
      throw new Error('Order ID is required for payment operations')
    }
  }

  const createPayment = async (payment: {
    amount: number
    payment_method?: PaymentMethod
    currency?: string
    payment_date?: string
    notes?: string
    reference_number?: string
  }): Promise<void> => {
    ensureOrderId()

    await create({
      amount: payment.amount,
      category: 'SALES',
      type: 'INCOME',
      date: payment.payment_date ?? new Date().toISOString(),
      description: encodePaymentDescription({
        payment_method: payment.payment_method ?? DEFAULT_PAYMENT_METHOD,
        currency: payment.currency ?? DEFAULT_ORDERS_CONFIG.currency.default,
        notes: payment.notes ?? '',
      }),
      reference: payment.reference_number ?? referenceKey!,
    })
  }

  const updatePayment = async (
    id: string,
    updates: Partial<Pick<OrderPayment, 'amount' | 'payment_method' | 'currency' | 'payment_date' | 'notes' | 'reference_number'>>
  ): Promise<void> => {
    ensureOrderId()

    const existingRecord = data?.find((record) => record['id'] === id)
    const existingMetadata = decodePaymentDescription(existingRecord?.description)

    await update(id, {
      amount: updates.amount ?? existingRecord?.amount ?? 0,
      date: updates.payment_date ?? existingRecord?.date ?? new Date().toISOString(),
      description: encodePaymentDescription({
        payment_method: updates.payment_method ?? existingMetadata.payment_method ?? DEFAULT_PAYMENT_METHOD,
        currency: updates.currency ?? existingMetadata.currency ?? DEFAULT_ORDERS_CONFIG.currency.default,
        notes: updates.notes ?? existingMetadata.notes ?? '',
      }),
      reference: updates.reference_number ?? existingRecord?.reference ?? referenceKey!,
    })
  }

  const removePayment = async (id: string): Promise<void> => {
    await remove(id)
  }

  return {
    data: payments,
    payments,
    loading,
    error,
    create: createPayment,
    update: updatePayment,
    remove: removePayment,
    refresh: refetch,
  }
}

// Order totals calculator hook
export function useOrderTotals(
  items: OrderItem[], 
  config: OrdersModuleConfig = DEFAULT_ORDERS_CONFIG,
  discountAmount = 0,
  shippingAmount = 0
) {
  return useMemo((): OrderTotalsBreakdown => {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    
    const totals = calculateOrderTotals(itemsSubtotal, config, {
      discount_amount: discountAmount,
      shipping_amount: shippingAmount
    })

    return {
      items_subtotal: itemsSubtotal,
      discount_amount: totals.discount_amount,
      taxable_amount: itemsSubtotal - totals.discount_amount,
      tax_amount: totals.tax_amount,
      shipping_amount: totals.shipping_amount,
      total_amount: totals.total,
      currency: totals.currency,
      tax_rate: totals.tax_rate,
      tax_inclusive: totals.tax_inclusive
    }
  }, [items, config, discountAmount, shippingAmount])
}

// Order summary analytics
export function useOrderSummary(filters?: OrderFilters): {
  summary: OrderSummary | null
  loading: boolean
  error: CatchError | null
} {
  const { orders, loading, error } = useOrders(filters)

  const summary = useMemo((): OrderSummary | null => {
    if (!orders) {return null}

    const revenueByCurrency: Record<string, number> = {}
    const topSellingItems: Record<string, {
      recipe_id: string
      recipe_name: string
      quantity_sold: number
      revenue: number
    }> = {}

    let totalRevenue = 0
    let pendingOrders = 0
    let completedOrders = 0
    let cancelledOrders = 0

    orders.forEach(order => {
      const currency = resolveOrderCurrency(order)
      revenueByCurrency[currency] ||= 0
      if (typeof order.total_amount === 'number') {
        revenueByCurrency[currency] += order.total_amount
        totalRevenue += order.total_amount
      }

       // Status counts
       switch (order['status']) {
         case 'DELIVERED':
           completedOrders++
           break
         case 'CANCELLED':
           cancelledOrders++
           break
         case 'PENDING':
         case 'CONFIRMED':
         case 'IN_PROGRESS':
         case 'READY':
           pendingOrders++
           break
         case null:
           break
         default:
           break
       }

      // Top selling items tracking - items would need to be fetched separately
      // Skipping for now as order.items doesn't exist on the base type
    })

    return {
      total_orders: orders.length,
      total_revenue: totalRevenue,
      revenue_by_currency: revenueByCurrency,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      average_order_value: orders.length > 0 ? totalRevenue / orders.length : 0,
      top_selling_items: Object.values(topSellingItems)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    }
  }, [orders])

  return { summary, loading, error }
}

// Order status management
export function useOrderStatus(orderId: string) {
  const { update } = useOrders()

  const updateStatus = async (newStatus: 'CANCELLED' | 'CONFIRMED' | 'DELIVERED' | 'IN_PROGRESS' | 'PENDING' | 'READY', reason?: string) => {
    try {
      await update(orderId, {
        status: newStatus,
        notes: reason ? `Status changed to ${newStatus}: ${reason}` : null
      })
     } catch (error) {
       throw new Error(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`)
     }
  }

  const canTransitionTo = (currentStatus: string, targetStatus: string): boolean => {
    // Define allowed transitions
    const transitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['READY', 'CANCELLED'],
      'READY': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    }

    return transitions[currentStatus]?.includes(targetStatus) ?? false
  }

  return {
    updateStatus,
    canTransitionTo
  }
}

// Currency formatting helper hook
export function useOrderCurrency(currency?: string) {
  const defaultCurrency = DEFAULT_ORDERS_CONFIG.currency.default

  const formatAmount = (amount: number, _options?: {
    showSymbol?: boolean
    showCode?: boolean
  }) => {
    const activeCurrency = currency ?? defaultCurrency
    return formatCurrency(amount, { code: activeCurrency, symbol: '$', name: 'USD', decimals: 2 })
  }

  const parseAmount = (currencyString: string) => {
    const activeCurrency = currency ?? defaultCurrency
    return parseCurrencyString(currencyString, { code: activeCurrency, symbol: '$', name: 'USD', decimals: 2 })
  }

  return {
    currency: currency ?? defaultCurrency,
    formatAmount,
    parseAmount
  }
}

// Invoice generation hook
export function useInvoiceGeneration() {
  const generateInvoice = (order: Order, companyInfo?: InvoiceData['company_info']): InvoiceData => {
    // Calculate subtotal from total_amount and discount
    const discountAmount = order.discount ?? 0
    const totalAmount = order.total_amount ?? 0
    const taxAmount = order.tax_amount ?? 0
    const shippingAmount = order.delivery_fee ?? 0
    const itemsSubtotal = totalAmount - taxAmount - shippingAmount + discountAmount
    
    const totalsBreakdown: OrderTotalsBreakdown = {
      items_subtotal: itemsSubtotal,
      discount_amount: discountAmount,
      taxable_amount: itemsSubtotal - discountAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
      currency: resolveOrderCurrency(order),
      tax_rate: resolveOrderTaxRate(order),
      tax_inclusive: resolveOrderTaxInclusive(order)
    }

    // Default payment terms (30 days) since field doesn't exist in DB
    const paymentTermsDays = DEFAULT_ORDERS_CONFIG.payment.default_terms_days
    const paymentTerms = `Payment due within ${paymentTermsDays} days`
    const dueDate = new Date(order.order_date ?? new Date())
    dueDate.setDate(dueDate.getDate() + paymentTermsDays)

    return {
      order,
      company_info: companyInfo ?? { name: '', address: '', phone: '', email: '' },
      totals_breakdown: totalsBreakdown,
      payment_terms: paymentTerms,
      due_date: dueDate.toISOString().split('T')[0] as string,
      invoice_number: order['order_no'] ?? `INV-${order['id'].slice(-8)}`,
      notes: order.notes as string | null | undefined
    }
  }

  return { generateInvoice }
}

// Order validation hook
export function useOrderValidation() {
  const validateOrder = (orderData: CreateOrderData): string[] => {
    const errors: string[] = []

    // Basic validation
    if (!orderData.customer_id) {
      errors.push('Customer is required')
    }

    if (!orderData.items || orderData.items.length === 0) {
      errors.push('At least one item is required')
    }

    // Items validation
    orderData.items?.forEach((item, index: number) => {
      if (!item.recipe_id) {
        errors.push(`Item ${index + 1}: Recipe is required`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
    })

    // Amount validation
    if (orderData.discount_amount && orderData.discount_amount < 0) {
      errors.push('Discount amount cannot be negative')
    }

    if (orderData.shipping_amount && orderData.shipping_amount < 0) {
      errors.push('Shipping amount cannot be negative')
    }

    // Tax validation
    if (orderData.tax_rate && (orderData.tax_rate < 0 || orderData.tax_rate > 1)) {
      errors.push('Tax rate must be between 0 and 100%')
    }

    return errors
  }

  const validateOrderUpdate = (_updateData: UpdateOrderData): string[] => {
    const errors: string[] = []

    // Status transition validation would go here
    // This would check against workflow.auto_transitions in config

    return errors
  }

  return {
    validateOrder,
    validateOrderUpdate
  }
}
