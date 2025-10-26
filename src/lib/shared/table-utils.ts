/**
 * Shared Table/Data Utilities
 * Common patterns for data tables, grids, and data display components
 */

import * as React from 'react'
import { useMemo } from 'react'

// Table column configuration types
export interface TableColumn<T = any> {
  key: keyof T | string
  header: string
  sortable?: boolean
  filterable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => React.ReactNode
  format?: (value: any) => string
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  sorting?: {
    key: string
    direction: 'asc' | 'desc'
  }
  filters?: Record<string, any>
}

// Table sorting utilities
export function sortData<T>(
  data: T[],
  sortKey: keyof T | string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortKey as string)
    const bValue = getNestedValue(b, sortKey as string)

    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Table filtering utilities
export function filterData<T>(
  data: T[],
  filters: Record<string, any>
): T[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || filterValue === '') return true

      const itemValue = getNestedValue(item, key)
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(filterValue.toLowerCase())
      }
      return itemValue === filterValue
    })
  })
}

// Table pagination utilities
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    data: data.slice(startIndex, endIndex),
    total,
    totalPages
  }
}

// Combined table operations hook
export function useTableData<T>(
  initialData: T[],
  config?: {
    initialSort?: { key: string; direction: 'asc' | 'desc' }
    initialFilters?: Record<string, any>
    initialPage?: number
    pageSize?: number
  }
) {
  const [data, setData] = React.useState(initialData)
  const [sorting, setSorting] = React.useState(config?.initialSort)
  const [filters, setFilters] = React.useState(config?.initialFilters || {})
  const [currentPage, setCurrentPage] = React.useState(config?.initialPage || 1)
  const [pageSize] = React.useState(config?.pageSize || 10)

  // Apply operations in correct order: filter -> sort -> paginate
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply filters
    result = filterData(result, filters)

    // Apply sorting
    if (sorting) {
      result = sortData(result, sorting.key, sorting.direction)
    }

    return result
  }, [data, filters, sorting])

  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginateData(processedData, currentPage, pageSize)
  }, [processedData, currentPage, pageSize])

  const handleSort = (key: string) => {
    setSorting(prev => {
      if (prev?.key === key) {
        // Toggle direction
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      // New sort
      return { key, direction: 'asc' }
    })
    setCurrentPage(1) // Reset to first page
  }

  const handleFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return {
    // Data
    data: paginatedData.data,
    total: paginatedData.total,
    totalPages: paginatedData.totalPages,

    // State
    sorting,
    filters,
    currentPage,
    pageSize,

    // Actions
    handleSort,
    handleFilter,
    handlePageChange,
    setData,

    // Computed
    hasData: paginatedData.total > 0,
    isEmpty: paginatedData.total === 0,
    canGoPrev: currentPage > 1,
    canGoNext: currentPage < paginatedData.totalPages
  }
}

// Table cell formatters
export const tableFormatters = {
  currency: (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value)
  },

  number: (value: number, decimals: number = 0) => {
    return value.toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  },

  percentage: (value: number) => {
    return `${value.toFixed(1)}%`
  },

  date: (value: string | Date) => {
    return new Intl.DateTimeFormat('id-ID').format(new Date(value))
  },

  dateTime: (value: string | Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value))
  },

  boolean: (value: boolean) => {
    return value ? 'Ya' : 'Tidak'
  },

  truncate: (value: string, length: number = 50) => {
    return value.length > length ? `${value.slice(0, length)}...` : value
  }
}

// Common table column configurations
export const commonColumns = {
  actions: (render: (row: any) => React.ReactNode) => ({
    key: 'actions',
    header: 'Aksi',
    width: 120,
    align: 'center' as const,
    render
  }),

  status: (key: string = 'status', statusMap?: Record<string, string>) => ({
    key,
    header: 'Status',
    width: 100,
    render: (value: string) => {
      const displayValue = statusMap?.[value] || value
      const getStatusClasses = (status: string) => {
        switch (status) {
          case 'active':
          case 'completed':
            return 'bg-green-100 text-green-800'
          case 'inactive':
          case 'cancelled':
            return 'bg-red-100 text-red-800'
          case 'pending':
            return 'bg-yellow-100 text-yellow-800'
          default:
            return 'bg-gray-100 text-gray-800'
        }
      }

      return React.createElement('span', {
        className: `px-2 py-1 text-xs rounded-full ${getStatusClasses(value)}`
      }, displayValue)
    }
  }),

  currency: (key: string, header: string, width?: number) => ({
    key,
    header,
    width: width || 120,
    align: 'right' as const,
    format: tableFormatters.currency
  }),

  date: (key: string, header: string, width?: number) => ({
    key,
    header,
    width: width || 100,
    format: tableFormatters.date
  })
}

// Table export utilities
export function exportToCSV<T>(
  data: T[],
  columns: TableColumn<T>[],
  filename: string = 'export.csv'
) {
  const headers = columns.map(col => col.header).join(',')
  const rows = data.map(row =>
    columns.map(col => {
      const value = getNestedValue(row, col.key as string)
      const formatted = col.format ? col.format(value) : String(value || '')
      // Escape quotes and wrap in quotes if contains comma
      const escaped = formatted.replace(/"/g, '""')
      return escaped.includes(',') ? `"${escaped}"` : escaped
    }).join(',')
  )

  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Table selection utilities
export function useTableSelection<T extends { id: string | number }>(data: T[]) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set())

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      if (prev.size === data.length) {
        return new Set() // Deselect all
      } else {
        return new Set(data.map(item => item.id)) // Select all
      }
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const selectedItems = data.filter(item => selectedIds.has(item.id))

  return {
    selectedIds,
    selectedItems,
    isAllSelected: selectedIds.size === data.length,
    isIndeterminate: selectedIds.size > 0 && selectedIds.size < data.length,
    toggleSelect,
    toggleSelectAll,
    clearSelection
  }
}

// Virtual scrolling utilities (for large datasets)
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop)
    }
  }
}
