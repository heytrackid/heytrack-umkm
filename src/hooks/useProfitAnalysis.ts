import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface ProfitData {
  total_revenue: number
  total_cost: number
  gross_profit: number
  net_profit: number
  profit_margin: number
  period: {
    start_date: string
    end_date: string
  }
  breakdown?: {
    ingredient_costs: number
    operational_costs: number
    other_expenses: number
  }
  by_product?: Array<{
    recipe_id: string
    recipe_name: string
    revenue: number
    cost: number
    profit: number
    margin: number
  }>
  trend?: Array<{
    date: string
    revenue: number
    cost: number
    profit: number
  }>
}

interface ProfitFilters {
  startDate?: string
  endDate?: string
  includeBreakdown?: boolean
  groupBy?: 'day' | 'week' | 'month'
}

/**
 * Get profit analysis data
 */
export function useProfitData(filters?: ProfitFilters) {
  const params = new URLSearchParams()
  if (filters?.startDate) params.append('start_date', filters.startDate)
  if (filters?.endDate) params.append('end_date', filters.endDate)
  if (filters?.includeBreakdown) params.append('include_breakdown', 'true')
  if (filters?.groupBy) params.append('group_by', filters.groupBy)

  return useQuery<ProfitData>({
    queryKey: ['profit-data', filters],
    queryFn: () => fetchApi<ProfitData>(`/api/reports/profit?${params}`),
  })
}

/**
 * Export profit report
 */
export function useExportProfitReport() {
  return async (filters?: ProfitFilters, format: 'pdf' | 'excel' = 'pdf') => {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('start_date', filters.startDate)
    if (filters?.endDate) params.append('end_date', filters.endDate)
    params.append('export', format)

    const response = await fetch(`/api/reports/profit?${params}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to export profit report')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profit-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}

/**
 * Get profit comparison between periods
 */
export function useProfitComparison(
  currentPeriod: { startDate: string; endDate: string },
  previousPeriod: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ['profit-comparison', currentPeriod, previousPeriod],
    queryFn: () => {
      const params = new URLSearchParams({
        current_start: currentPeriod.startDate,
        current_end: currentPeriod.endDate,
        previous_start: previousPeriod.startDate,
        previous_end: previousPeriod.endDate,
      })

      return fetchApi(`/api/reports/profit/comparison?${params}`)
    },
  })
}
