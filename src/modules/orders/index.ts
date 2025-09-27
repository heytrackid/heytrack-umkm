/**
 * Orders Domain Module
 * Centralized exports untuk semua functionality terkait orders & customers
 */

// Components
export { default as OrdersPage } from './components/OrdersPage'
export { default as OrderForm } from './components/OrderForm'
export { default as OrderDetailView } from './components/OrderDetailView'
export { default as OrderStatusBadge } from './components/OrderStatusBadge'
export { default as CustomerForm } from './components/CustomerForm'
export { default as CustomerList } from './components/CustomerList'

// Hooks
export { useOrdersData } from './hooks/useOrdersData'
export { useCustomersData } from './hooks/useCustomersData'
export { useOrderAnalytics } from './hooks/useOrderAnalytics'
export { useOrderStateMachine } from './hooks/useOrderStateMachine'

// Services
export { OrdersService } from './services/OrdersService'
export { CustomersService } from './services/CustomersService'
export { OrderCalculationService } from './services/OrderCalculationService'

// Types
export type {
  Order,
  OrderItem,
  Customer,
  OrderStats,
  OrderFilters,
  OrderStatus,
  PaymentStatus
} from './types'

// Utils
export { 
  calculateOrderTotal,
  formatOrderNumber,
  getOrderStatusInfo,
  validateOrderData,
  canUpdateOrderStatus
} from './utils'

// Constants
export { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_PRIORITIES } from './constants'