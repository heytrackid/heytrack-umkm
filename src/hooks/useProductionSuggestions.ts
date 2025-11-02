import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiLogger } from '@/lib/logger'




interface ProductionSuggestion {
  recipe_id: string
  recipe_name: string
  total_quantity: number
  order_count: number
  estimated_cost: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface CreateBatchRequest {
  order_ids: string[]
  planned_date?: string
}

export function useProductionSuggestions() {
  return useQuery({
    queryKey: ['production-suggestions'],
    queryFn: async () => {
      const response = await fetch('/api/production/suggestions')
      if (!response.ok) {
        throw new Error('Failed to fetch production suggestions')
      }
      const data = await response.json()
      return data as {
        data: ProductionSuggestion[]
        meta: {
          total: number
          high_priority: number
          medium_priority: number
          low_priority: number
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  })
}

export function useCreateProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateBatchRequest) => {
      const response = await fetch('/api/production/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? 'Failed to create production batch')
      }

      return response.json()
    },
    onSuccess: (data) => {
      apiLogger.info({ batchId: data.batch_id }, 'Production batch created:')
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['production-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['productions'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      apiLogger.error({ error }, 'Failed to create production batch:')
    }
  })
}
