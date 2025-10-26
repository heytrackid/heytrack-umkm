// Orders service hooks with multi-currency and optional VAT support
'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { useSupabaseQuery, useSupabaseCRUD } from '@/hooks';
import type {
  Order,
  OrderItem,
  OrderPayment,
  CreateOrderData,
  UpdateOrderData,
  OrderFilters,
  OrderSummary,
  OrderStatus,
  OrderTotalsBreakdown,
  InvoiceData
} from '../types/orders.types';
import {
  OrderAnalytics
} from '../types/orders.types'
import {
  DEFAULT_ORDERS_CONFIG,
  calculateOrderTotals,
  type OrdersModuleConfig
} from '../config/orders.config'
import { REGIONAL_DEFAULTS, RegionalDefaults } from '@/lib/shared/utils/currency'
import { formatCurrency, parseCurrencyString } from '@/lib/currency'

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
    delete: deleteRecord,
    loading: crudLoading,
    error: crudError,
    clearError
  } = useSupabaseCRUD('orders')

  // Combine loading states
  const loading = queryLoading || crudLoading

  // Combine errors
  const error = queryError || crudError

  // Memoized orders data
  const orders = useMemo(() => {
    if (!ordersData) return []

    // Apply filters if provided
    let filteredOrders = ordersData

    if (filters) {
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status)
      }
      if (filters.payment_status) {
        filteredOrders = filteredOrders.filter(order => order.payment_status === filters.payment_status)
      }
      if (filters.priority) {
        filteredOrders = filteredOrders.filter(order => order.priority === filters.priority)
      }
      if (filters.date_from) {
        filteredOrders = filteredOrders.filter(order => new Date(order.created_at!) >= new Date(filters.date_from!))
      }
      if (filters.date_to) {
        filteredOrders = filteredOrders.filter(order => new Date(order.created_at!) <= new Date(filters.date_to!))
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.customer_name?.toLowerCase().includes(searchLower) ||
          order.order_no?.toLowerCase().includes(searchLower)
        )
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
    orderBy: { column: 'created_at', ascending: true }
  })

  // Use useSupabaseCRUD for operations
  const {
    create,
    update,
    delete: deleteItem
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

// Order payments tracking
export function useOrderPayments(orderId: string) {
  // TODO: Implement when order_payments table is created
  // For now, return empty data structure
  return {
    data: [],
    payments: [],
    loading: false,
    error: null,
    create: async () => { throw new Error('Order payments not yet implemented') },
    update: async () => { throw new Error('Order payments not yet implemented') },
    remove: async () => { throw new Error('Order payments not yet implemented') },
    refresh: async () => {}
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
  error: unknown
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
  const { update } = useOrders()

  const updateStatus = async (newStatus: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED', reason?: string) => {
    try {
      await update(orderId, {
        status: newStatus,
        notes: reason ? `Status changed to ${newStatus}: ${reason}` : undefined
      })
    } catch (error: unknown) {
      throw new Error(`Failed to update order status: ${error}`)
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

    return transitions[currentStatus]?.includes(targetStatus) || false
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
    return formatCurrency(amount, { code: currency || defaultCurrency, symbol: '$', name: 'USD', decimals: 2 })
  }

  const parseAmount = (currencyString: string) => {
    return parseCurrencyString(currencyString, { code: currency || defaultCurrency, symbol: '$', name: 'USD', decimals: 2 })
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
