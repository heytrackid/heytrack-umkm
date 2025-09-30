// Orders service hooks with multi-currency and optional VAT support
'use client'

import { useMemo } from 'react'
import { useSupabaseCRUD } from '@/hooks/useSupabaseCRUD'
import { useSupabaseData } from '@/hooks/useSupabaseData'
import { 
  Order, 
  OrderItem, 
  OrderPayment,
  CreateOrderData, 
  UpdateOrderData, 
  OrderFilters,
  OrderSummary,
  OrderAnalytics,
  OrderStatus,
  OrderTotalsBreakdown,
  InvoiceData
} from '../types/orders.types'
import { 
  DEFAULT_ORDERS_CONFIG,
  calculateOrderTotals,
  type OrdersModuleConfig
} from '../config/orders.config'
import { formatCurrency, parseCurrency } from '@/shared/utils/currency'

// Main orders hook
export function useOrders(filters?: OrderFilters) {
  const { 
    data: orders, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<Order, CreateOrderData, UpdateOrderData>({
    table: 'orders',
    relationConfig: {
      items: {
        table: 'order_items',
        foreignKey: 'order_id'
      },
      payments: {
        table: 'order_payments',
        foreignKey: 'order_id'
      }
    },
    orderBy: [{ column: 'created_at', ascending: false }]
  })

  // Filter orders based on criteria
  const filteredOrders = useMemo(() => {
    if (!orders || !filters) return orders

    return orders.filter(order => {
      // Status filter
      if (filters.status?.length && !filters.status.includes(order.status)) {
        return false
      }

      // Priority filter
      if (filters.priority?.length && !filters.priority.includes(order.priority)) {
        return false
      }

      // Customer filter
      if (filters.customer_id && order.customer_id !== filters.customer_id) {
        return false
      }

      // Currency filter
      if (filters.currency?.length && !filters.currency.includes(order.currency)) {
        return false
      }

      // Payment status filter
      if (filters.payment_status?.length && !filters.payment_status.includes(order.payment_status)) {
        return false
      }

      // Payment method filter
      if (filters.payment_method?.length && order.payment_method && 
          !filters.payment_method.includes(order.payment_method)) {
        return false
      }

      // Date range filter
      if (filters.date_from && order.order_date < filters.date_from) {
        return false
      }
      if (filters.date_to && order.order_date > filters.date_to) {
        return false
      }

      // Delivery date range filter
      if (filters.delivery_date_from && order.delivery_date && 
          order.delivery_date < filters.delivery_date_from) {
        return false
      }
      if (filters.delivery_date_to && order.delivery_date && 
          order.delivery_date > filters.delivery_date_to) {
        return false
      }

      // Amount range filter
      if (filters.min_amount !== undefined && order.total_amount < filters.min_amount) {
        return false
      }
      if (filters.max_amount !== undefined && order.total_amount > filters.max_amount) {
        return false
      }

      // Tags filter
      if (filters.tags?.length && order.tags && 
          !filters.tags.some(tag => order.tags!.includes(tag))) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableText = [
          order.order_number,
          order.customer_name,
          order.notes,
          order.internal_notes
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [orders, filters])

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    createOrder: create,
    updateOrder: update,
    deleteOrder: remove,
    refreshOrders: refresh
  }
}

// Order items management
export function useOrderItems(orderId: string) {
  const { 
    data: items, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<OrderItem>({
    table: 'order_items',
    filter: [{ column: 'order_id', operator: 'eq', value: orderId }],
    orderBy: [{ column: 'created_at', ascending: true }]
  })

  return {
    items: items || [],
    loading,
    error,
    addItem: create,
    updateItem: update,
    removeItem: remove,
    refreshItems: refresh
  }
}

// Order payments tracking
export function useOrderPayments(orderId: string) {
  const { 
    data: payments, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    refresh
  } = useSupabaseCRUD<OrderPayment>({
    table: 'order_payments',
    filter: [{ column: 'order_id', operator: 'eq', value: orderId }],
    orderBy: [{ column: 'payment_date', ascending: false }]
  })

  return {
    payments: payments || [],
    loading,
    error,
    addPayment: create,
    updatePayment: update,
    removePayment: remove,
    refreshPayments: refresh
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
  error: any
} {
  const { orders, loading, error } = useOrders(filters)

  const summary = useMemo((): OrderSummary | null => {
    if (!orders) return null

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
      // Revenue tracking by currency
      if (!revenueByCurrency[order.currency]) {
        revenueByCurrency[order.currency] = 0
      }
      revenueByCurrency[order.currency] += order.total_amount
      totalRevenue += order.total_amount // Assuming base currency conversion

      // Status counts
      switch (order.status) {
        case 'delivered':
          completedOrders++
          break
        case 'cancelled':
        case 'refunded':
          cancelledOrders++
          break
        case 'draft':
        case 'confirmed':
        case 'payment_pending':
        case 'paid':
        case 'in_production':
        case 'ready':
          pendingOrders++
          break
      }

      // Top selling items tracking
      order.items?.forEach((item: any) => {
        if (!topSellingItems[item.recipe_id]) {
          topSellingItems[item.recipe_id] = {
            recipe_id: item.recipe_id,
            recipe_name: item.recipe_name,
            quantity_sold: 0,
            revenue: 0
          }
        }
        topSellingItems[item.recipe_id].quantity_sold += item.quantity
        topSellingItems[item.recipe_id].revenue += item.total_price
      })
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
  const { updateOrder } = useOrders()

  const updateStatus = async (newStatus: OrderStatus, reason?: string) => {
    try {
      await updateOrder(orderId, { 
        status: newStatus,
        internal_notes: reason ? `Status changed to ${newStatus}: ${reason}` : undefined
      })
    } catch (error) {
      throw new Error(`Failed to update order status: ${error}`)
    }
  }

  const canTransitionTo = (currentStatus: OrderStatus, targetStatus: OrderStatus): boolean => {
    const transitions = DEFAULT_ORDERS_CONFIG.workflow.auto_transitions[currentStatus] || []
    return transitions.includes(targetStatus)
  }

  return {
    updateStatus,
    canTransitionTo
  }
}

// Currency formatting helper hook
export function useOrderCurrency(currency?: string) {
  const defaultCurrency = DEFAULT_ORDERS_CONFIG.currency.default

  const formatAmount = (amount: number, options?: {
    showSymbol?: boolean
    showCode?: boolean
  }) => {
    return formatCurrency(amount, currency || defaultCurrency, options)
  }

  const parseAmount = (currencyString: string) => {
    return parseCurrency(currencyString, currency || defaultCurrency)
  }

  return {
    currency: currency || defaultCurrency,
    formatAmount,
    parseAmount
  }
}

// Invoice generation hook
export function useInvoiceGeneration() {
  const generateInvoice = (order: Order, companyInfo?: InvoiceData['company_info']): InvoiceData => {
    const totalsBreakdown: OrderTotalsBreakdown = {
      items_subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      taxable_amount: order.subtotal - order.discount_amount,
      tax_amount: order.tax_amount,
      shipping_amount: order.shipping_amount,
      total_amount: order.total_amount,
      currency: order.currency,
      tax_rate: order.tax_rate,
      tax_inclusive: order.tax_inclusive
    }

    const paymentTerms = `Payment due within ${order.payment_terms_days} days`
    const dueDate = new Date(order.order_date)
    dueDate.setDate(dueDate.getDate() + order.payment_terms_days)

    return {
      order,
      company_info: companyInfo,
      totals_breakdown: totalsBreakdown,
      payment_terms: paymentTerms,
      due_date: dueDate.toISOString().split('T')[0],
      invoice_number: order.order_number,
      notes: order.notes
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
    orderData.items?.forEach((item, index) => {
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

  const validateOrderUpdate = (updateData: UpdateOrderData): string[] => {
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