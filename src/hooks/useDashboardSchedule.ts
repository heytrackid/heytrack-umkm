import { useQuery } from '@tanstack/react-query'




interface ProductionBatch {
  id: string
  quantity: number
  batch_status: string
  planned_start_time: string
  actual_start_time: string | null
  total_orders: number
  recipe: {
    id: string
    name: string
    image_url: string | null
    cost_per_unit: number
  }
}

interface PendingOrder {
  id: string
  order_no: string
  customer_name: string | null
  delivery_date: string | null
  production_priority: string | null
  status: string
  order_items: Array<{
    recipe: {
      name: string
    }
  }>
}

interface LowStockAlert {
  id: string
  name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  unit: string
  availability_status: string
}

export function useDashboardSchedule() {
  return useQuery({
    queryKey: ['dashboard-schedule'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/production-schedule')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard schedule')
      }

      const data = await response.json()
      return data as {
        production_schedule: ProductionBatch[]
        pending_orders: PendingOrder[]
        low_stock_alerts: LowStockAlert[]
        summary: {
          total_batches_today: number
          planned_batches: number
          in_progress_batches: number
          completed_batches: number
          pending_orders_count: number
          urgent_orders: number
          critical_stock_items: number
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true
  })
}
