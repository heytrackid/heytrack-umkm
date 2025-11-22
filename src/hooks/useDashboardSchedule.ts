import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface DashboardSchedule {
  production_schedule: Array<{
    id: string
    batch_name?: string
    status?: string
    scheduled_date?: string
    quantity: number
    recipe?: { name: string }
    total_orders?: number
    batch_status?: string
    priority?: string
  }>
  pending_orders: Array<{
    id: string
    order_no: string
    customer_name: string | null
    delivery_date: string | null
    status?: string
    production_priority?: string
  }>
  low_stock_alerts: Array<{
    ingredient_id: string
    ingredient_name: string
    current_stock: number
    reorder_point: number
  }>
  summary: {
    total_batches: number
    total_orders: number
    total_alerts: number
    total_batches_today?: number
    planned_batches?: number
    in_progress_batches?: number
    pending_orders_count?: number
    urgent_orders?: number
    critical_stock_items?: number
    completed_batches?: number
  }
}

/**
 * Get dashboard schedule data (upcoming production batches and orders)
 */
export function useDashboardSchedule() {
  return useQuery<DashboardSchedule>({
    queryKey: ['dashboard-schedule'],
    queryFn: () => fetchApi<DashboardSchedule>('/api/dashboard/schedule'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
