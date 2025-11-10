'use client'

import { useCallback, useState } from 'react'

interface ExportFilters {
  recipeId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export function useHPPExport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const buildQuery = (filters?: ExportFilters) => {
    if (!filters) {return ''}
    const params = new URLSearchParams()
    if (filters.recipeId) {params.set('recipe_id', filters.recipeId)}
    if (filters.startDate) {params.set('start_date', filters.startDate)}
    if (filters.endDate) {params.set('end_date', filters.endDate)}
    if (filters.search) {params.set('search', filters.search)}
    return params.toString() ? `?${params.toString()}` : ''
  }

  const exportCalculations = useCallback(async (filters?: ExportFilters) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/hpp/calculations${buildQuery(filters)}`, {
        cache: 'no-store'
      })
      if (!response.ok) {
        const { error: message } = await response.json().catch(() => ({ error: 'Failed to export HPP data' }))
        throw new Error(message ?? 'Failed to export HPP data')
      }
      return await response.json()
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error('Unknown export error')
      setError(normalized)
      throw normalized
    } finally {
      setLoading(false)
    }
  }, [])

  const downloadExport = useCallback(async (filters?: ExportFilters) => {
    const payload = await exportCalculations(filters)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `HeyTrack_HPP_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [exportCalculations])

  return {
    loading,
    error,
    exportCalculations,
    downloadExport
  }
}
