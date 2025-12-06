import type { OrderStatus } from '@/types/database'

export interface OrderStats {
  total_orders: number
  pending_orders: number
  confirmed_orders: number
  in_production_orders: number
  completed_orders: number
  cancelled_orders: number
  total_revenue: number
  pending_revenue: number
  paid_revenue: number
  average_order_value: number
  total_customers: number
  repeat_customers: number
  period_growth: number
  revenue_growth: number
  order_growth: number
}

export interface OrderFilters {
  status: OrderStatus[]
  payment_status: string[]
  customer_search?: string
}

export interface OrdersPageProps {
  userRole?: 'admin' | 'manager' | 'staff'
  enableAdvancedFeatures?: boolean
}
