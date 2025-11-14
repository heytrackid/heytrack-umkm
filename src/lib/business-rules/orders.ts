/**
 * Order Business Rules
 * Based on AGENTS.md specifications
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

/**
 * Validate order status transition
 * State machine pattern for order lifecycle
 */
export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): {
  valid: boolean
  message: string
} {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [], // Final state
    CANCELLED: [], // Final state
  }

  const allowedTransitions = validTransitions[currentStatus]

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from ${currentStatus} to ${newStatus}`,
    }
  }

  return {
    valid: true,
    message: 'Status transition is valid',
  }
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(
  status: OrderStatus,
  paymentStatus: PaymentStatus
): {
  canCancel: boolean
  reason: string
} {
  // Cannot cancel if already delivered
  if (status === 'DELIVERED') {
    return {
      canCancel: false,
      reason: 'Order has already been delivered',
    }
  }

  // Cannot cancel if already cancelled
  if (status === 'CANCELLED') {
    return {
      canCancel: false,
      reason: 'Order is already cancelled',
    }
  }

  // Warn if payment has been made
  if (paymentStatus === 'PAID') {
    return {
      canCancel: true,
      reason: 'Order can be cancelled but refund will be required',
    }
  }

  return {
    canCancel: true,
    reason: 'Order can be cancelled',
  }
}

/**
 * Calculate payment deadline
 */
export function calculatePaymentDeadline(
  orderDate: Date,
  paymentTermDays: number = 7
): Date {
  const deadline = new Date(orderDate)
  deadline.setDate(deadline.getDate() + paymentTermDays)
  return deadline
}

/**
 * Check if payment is overdue
 */
export function isPaymentOverdue(
  orderDate: Date,
  paymentStatus: PaymentStatus,
  paymentTermDays: number = 7
): boolean {
  if (paymentStatus === 'PAID') return false

  const deadline = calculatePaymentDeadline(orderDate, paymentTermDays)
  return new Date() > deadline
}

/**
 * Validate stock before order confirmation
 */
export function validateOrderStock(
  orderItems: Array<{
    ingredientId: string
    requiredQuantity: number
    availableStock: number
  }>
): {
  valid: boolean
  insufficientItems: Array<{
    ingredientId: string
    required: number
    available: number
    shortfall: number
  }>
} {
  const insufficientItems = orderItems
    .filter((item) => item.availableStock < item.requiredQuantity)
    .map((item) => ({
      ingredientId: item.ingredientId,
      required: item.requiredQuantity,
      available: item.availableStock,
      shortfall: item.requiredQuantity - item.availableStock,
    }))

  return {
    valid: insufficientItems.length === 0,
    insufficientItems,
  }
}

/**
 * Calculate order total with discounts
 */
export function calculateOrderTotal(
  subtotal: number,
  discountPercent: number = 0,
  taxPercent: number = 0,
  shippingCost: number = 0
): {
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
} {
  const discount = (subtotal * discountPercent) / 100
  const afterDiscount = subtotal - discount
  const tax = (afterDiscount * taxPercent) / 100
  const total = afterDiscount + tax + shippingCost

  return {
    subtotal,
    discount,
    tax,
    shipping: shippingCost,
    total,
  }
}
