import { createClientLogger } from '@/lib/client-logger'
import { useMutation } from '@tanstack/react-query'

import { toast } from 'sonner'

const logger = createClientLogger('useGlobalExport')

/**
 * Export all data globally
 */
export function useGlobalExport() {
  return useMutation({
    mutationFn: async (format: 'json' | 'csv' | 'excel' = 'json') => {
      const params = new URLSearchParams({ format })
      const response = await fetch(`/api/export/global?${params}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const extension = format === 'excel' ? 'xlsx' : format
      a.download = `heytrack-export-${new Date().toISOString().split('T')[0]}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Data berhasil diexport')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to export data')
      toast.error('Gagal export data')
    },
  })
}

/**
 * Export specific entity data
 */
export function useEntityExport() {
  return useMutation({
    mutationFn: async (data: {
      entity: 'ingredients' | 'recipes' | 'orders' | 'customers' | 'suppliers'
      format: 'json' | 'csv' | 'excel'
      filters?: Record<string, string>
    }) => {
      const params = new URLSearchParams({
        format: data.format,
        ...data.filters,
      })

      const response = await fetch(`/api/export/${data.entity}?${params}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to export entity data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const extension = data.format === 'excel' ? 'xlsx' : data.format
      a.download = `${data.entity}-export-${new Date().toISOString().split('T')[0]}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Data berhasil diexport')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to export entity data')
      toast.error('Gagal export data')
    },
  })
}
