import { createClientLogger } from '@/lib/client-logger'
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'

const logger = createClientLogger('useExpenses')

// Note: expenses table doesn't exist in DB yet, using financial_records instead
type Expense = Row<'financial_records'>
type ExpenseInsert = Insert<'financial_records'>
type ExpenseUpdate = Update<'financial_records'>

interface ExpenseStats {
  total: number
  by_category: Record<string, number>
  monthly_trend: Array<{
    month: string
    total: number
  }>
}

/**
 * Get all expenses
 */
export function useExpenses(params?: {
  category?: string
  startDate?: string
  endDate?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append('category', params.category)
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<Expense[]>({
    queryKey: ['expenses', params],
    queryFn: () => fetchApi<Expense[]>(`/api/expenses?${searchParams}`),
  })
}

/**
 * Get single expense by ID
 */
export function useExpense(id: string | null) {
  return useQuery<Expense>({
    queryKey: ['expense', id],
    queryFn: () => fetchApi<Expense>(`/api/expenses/${id}`),
    enabled: !!id,
  })
}

/**
 * Create new expense
 */
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<ExpenseInsert, 'user_id'>) => postApi('/api/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] })
      toast.success('Pengeluaran berhasil dicatat')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to create expense')
      toast.error('Gagal mencatat pengeluaran')
    },
  })
}

/**
 * Update expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseUpdate> }) => putApi(`/api/expenses/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense', id] })
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] })
      toast.success('Pengeluaran berhasil diperbarui')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to update expense')
      toast.error('Gagal memperbarui pengeluaran')
    },
  })
}

/**
 * Delete expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] })
      toast.success('Pengeluaran berhasil dihapus')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to delete expense')
      toast.error('Gagal menghapus pengeluaran')
    },
  })
}

/**
 * Get expense statistics
 */
export function useExpenseStats(params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<ExpenseStats>({
    queryKey: ['expense-stats', params],
    queryFn: () => fetchApi<ExpenseStats>(`/api/expenses/stats?${searchParams}`),
  })
}
