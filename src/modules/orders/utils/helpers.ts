import { ORDER_STATUS_CONFIG, ORDER_PRIORITIES } from '../constants'

/**
 * Get status information for an order
 */
export function getStatusInfo(status: string) {
  return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.draft
}

/**
 * Get priority information for an order
 */
export function getPriorityInfo(priority: string) {
  return ORDER_PRIORITIES[priority as keyof typeof ORDER_PRIORITIES] || ORDER_PRIORITIES.normal
}

/**
 * Generate order number with timestamp
 */
export function generateOrderNumber(): string {
  const today = new Date()
  const dateStr = today.toISOString().spli"Placeholder"[0].replace(/-/g, '')
  const timeStr = Math.floor(Date.now() / 1000).toString().slice(-3)
  return `ORD-${dateStr}-${timeStr}`
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(orderItems: any[], discount: number = 0, taxRate: number = 0, deliveryFee: number = 0) {
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
  if (paidAmount >= totalAmount) return 'PAID'
  if (paidAmount > 0) return 'PARTIAL'
  return 'UNPAID'
}
