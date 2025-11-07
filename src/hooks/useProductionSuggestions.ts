import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')




interface ProductionSuggestion {
  recipe_id: string
  recipe_name: string
  total_quantity: number
  order_count: number
  estimated_cost: number
  priority: 'HIGH' | 'LOW' | 'MEDIUM'
}

interface CreateBatchRequest {
  order_ids: string[]
  planned_date?: string
}

export function useProductionSuggestions() {
  return useQuery({
    queryKey: ['production-suggestions'],
    queryFn: async () => {
      const response = await fetch('/api/production/suggestions', {
        credentials: 'include', // Include cookies for authentication
      })
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
        body: JSON.stringify(request),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? 'Failed to create production batch')
      }

      return response.json()
    },
    onSuccess: (data) => {
      logger.info({ batchId: data.batch_id }, 'Production batch created:')
      // Invalidate related queries
      void queryClient.invalidateQueries({ queryKey: ['production-suggestions'] })
      void queryClient.invalidateQueries({ queryKey: ['productions'] })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to create production batch:')
    }
  })
}
