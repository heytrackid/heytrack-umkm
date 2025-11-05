import { useQuery } from '@tanstack/react-query'


interface RestockSuggestion {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_point: number
  suggested_order_quantity: number
  lead_time_days: number | null
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  reason: string
}

export function useRestockSuggestions() {
  return useQuery({
    queryKey: ['restock-suggestions'],
    queryFn: async () => {
      const response = await fetch('/api/inventory/restock-suggestions', {
        credentials: 'include', // Include cookies for authentication
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch restock suggestions')
      }

      const data = await response.json()
      return data as {
        data: RestockSuggestion[]
        summary: {
          total: number
          critical: number
          high: number
          medium: number
          low: number
          total_suggested_cost: number
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true
  })
}
