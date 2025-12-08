
import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'



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
    queryFn: async () => {
      const response = await fetchApi<{ data: Expense[] }>(`/api/expenses?${searchParams}`)
      // Extract data array if response has pagination structure
      return Array.isArray(response) ? response : response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
      void queryClient.invalidateQueries({ queryKey: ['expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['expense-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reports', 'profit'] })
      successToast('Berhasil', 'Pengeluaran berhasil dicatat')
    },
    onError: (error) => handleError(error, 'Create expense', true, 'Gagal mencatat pengeluaran'),
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
      void queryClient.invalidateQueries({ queryKey: ['expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['expense', id] })
      void queryClient.invalidateQueries({ queryKey: ['expense-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reports', 'profit'] })
      successToast('Berhasil', 'Pengeluaran berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update expense', true, 'Gagal memperbarui pengeluaran'),
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
      void queryClient.invalidateQueries({ queryKey: ['expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['expense-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reports', 'profit'] })
      successToast('Berhasil', 'Pengeluaran berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete expense', true, 'Gagal menghapus pengeluaran'),
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
