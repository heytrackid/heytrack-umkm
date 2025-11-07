import { ORDER_STATUS_CONFIG } from '@/modules/orders/constants'

import type { OrderStatus } from '@/modules/orders/types'



/**
 * Get status information for an order
 */
export function getStatusInfo(status: string) {
  return ORDER_STATUS_CONFIG[status as OrderStatus] || ORDER_STATUS_CONFIG.PENDING
}

/**
 * Get priority information for an order
 */
export function getPriorityInfo(_priority: string) {
  // Simplified - return default
  return {
    label: 'Normal',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  }
}



/**
 * Generate order number with timestamp
 */
export function generateOrderNo(): string {
  const today = new Date()
  const [datePart] = today.toISOString().split('T')
  const dateStr = (datePart ?? '').replace(/-/g, '')
  const timeStr = Math.floor(Date.now() / 1000).toString().slice(-3)
  return `ORD-${dateStr}-${timeStr}`
}

interface OrderItemWithPrice {
  total_price: number
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(orderItems: OrderItemWithPrice[], discount = 0, taxRate = 0, deliveryFee = 0) {
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal - discount + taxAmount + deliveryFee

  return {
    subtotal,
    taxAmount,
    totalAmount,
    deliveryFee
  }
}

/**
 * Get payment status from amounts
 */
export function getPaymentStatus(totalAmount: number, paidAmount: number): string {
  if (paidAmount >= totalAmount) {return 'PAID'}
  if (paidAmount > 0) {return 'PARTIAL'}
  return 'UNPAID'
}
