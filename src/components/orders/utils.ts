import type { OrderStatus, PaymentStatus, Priority, StatusInfo } from './types'
import { formatCurrentCurrency } from '@/shared'

// Order Status Configurations
export const orderStatuses: Record<OrderStatus, StatusInfo> = {
  'PENDING': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  'CONFIRMED': { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' },
  'IN_PROGRESS': { label: 'Dalam Proses', color: 'bg-orange-100 text-orange-800' },
  'READY': { label: 'Siap', color: 'bg-green-100 text-green-800' },
  'DELIVERED': { label: 'Terkirim', color: 'bg-green-100 text-green-800' },
  'CANCELLED': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
}

export const paymentStatuses: Record<PaymentStatus, StatusInfo> = {
  'UNPAID': { label: 'Belum Bayar', color: 'bg-red-100 text-red-800' },
  'PARTIAL': { label: 'Bayar Sebagian', color: 'bg-yellow-100 text-yellow-800' },
  'PAID': { label: 'Lunas', color: 'bg-green-100 text-green-800' }
}

export const priorities: Record<Priority, StatusInfo> = {
  'low': { label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
  'normal': { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  'high': { label: 'Tinggi', color: 'bg-red-100 text-red-800' },
  'urgent': { label: 'Mendesak', color: 'bg-purple-100 text-purple-800' }
}

// Helper functions
export function getStatusInfo(status: OrderStatus): StatusInfo {
  return orderStatuses[status] || orderStatuses.PENDING
}

export function getPaymentInfo(status: PaymentStatus): StatusInfo {
  return paymentStatuses[status] || paymentStatuses.UNPAID
}

export function getPriorityInfo(priority: Priority): StatusInfo {
  return priorities[priority] || priorities.normal
}

// Generate order number
export function generateOrderNo(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `ORD${year}${month}${day}${random}`
}

// Calculate order total
export function calculateOrderTotal(orderItems: Array<{quantity: number; unit_price: number}>): number {
  return orderItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0)
}

// Format currency
export const formatCurrency = formatCurrentCurrency

export { formatDate } from '@/shared'

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Validation
export { validateOrderData } from '@/lib/validations/form-validations'

// Status flow validation
export function canUpdateStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['READY', 'CANCELLED'],
    'READY': ['DELIVERED'],
    'DELIVERED': [],
    'CANCELLED': []
  }
  
  return statusFlow[currentStatus]?.includes(newStatus) || false
}