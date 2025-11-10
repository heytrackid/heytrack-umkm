import { type ReactNode, createElement, useMemo, useState, type UIEvent } from 'react'


/**
 * Shared Table/Data Utilities
 * Common patterns for data tables, grids, and data display components
 */


// Table column configuration types
export interface TableColumn<T = unknown, TValue = unknown> {
  key: string | keyof T
  header: string
  sortable?: boolean
  filterable?: boolean
  width?: number | string
  align?: 'center' | 'left' | 'right'
  render?: (value: TValue, row: T, index: number) => ReactNode
  format?: (value: TValue) => string
}

export interface TableConfig<T = unknown> {
  columns: Array<TableColumn<T>>
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
  filters?: Record<string, unknown>
}

// Table sorting utilities
export function sortData<T>(
  data: T[],
  sortKey: string | keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortKey as string)
    const bValue = getNestedValue(b, sortKey as string)

    const toComparable = (value: unknown): number | string => {
      if (typeof value === 'number') {return value}
      if (value instanceof Date) {return value.getTime()}
      if (typeof value === 'boolean') {return value ? 1 : 0}
      return String(value ?? '')
    }

    const aComparable = toComparable(aValue)
    const bComparable = toComparable(bValue)

    if (aComparable < bComparable) {return direction === 'asc' ? -1 : 1}
    if (aComparable > bComparable) {return direction === 'asc' ? 1 : -1}
    return 0
  })
}

// Table filtering utilities
export function filterData<T>(
  data: T[],
  filters: Record<string, unknown>
): T[] {
  return data.filter(item => Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || filterValue === '') {return true}

      const itemValue = getNestedValue(item, key)
      
      // String comparison
      if (typeof itemValue === 'string' && typeof filterValue === 'string') {
        return itemValue.toLowerCase().includes(filterValue.toLowerCase())
      }
      
      // Exact match for other types
      return itemValue === filterValue
    }))
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
    initialFilters?: Record<string, unknown>
    initialPage?: number
    pageSize?: number
  }
) {
  const [data, setData] = useState(initialData)
  const [sorting, setSorting] = useState(config?.initialSort)
  const [filters, setFilters] = useState<Record<string, unknown>>(config?.initialFilters ?? {})
  const [currentPage, setCurrentPage] = useState(config?.initialPage ?? 1)
  const [pageSize] = useState(config?.pageSize ?? 10)

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
  const paginatedData = useMemo(() => paginateData(processedData, currentPage, pageSize), [processedData, currentPage, pageSize])

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

  const handleFilter = (key: string, value: unknown) => {
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
    data: paginatedData['data'],
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
  currency: (value: number) => new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value),

  number: (value: number, decimals = 0) => value.toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }),

  percentage: (value: number) => `${value.toFixed(1)}%`,

  date: (value: Date | string) => new Intl.DateTimeFormat('id-ID').format(new Date(value)),

  dateTime: (value: Date | string) => new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value)),

  boolean: (value: boolean) => value ? 'Ya' : 'Tidak',

  truncate: (value: string, length = 50) => value.length > length ? `${value.slice(0, length)}...` : value
}

// Common table column configurations
export const commonColumns = {
  actions: <T>(render: (row: T) => ReactNode): TableColumn<T> => ({
    key: 'actions',
    header: 'Aksi',
    width: 120,
    align: 'center' as const,
    render: (_value: unknown, row: T) => render(row)
  }),

  status: <T>(key = 'status', statusMap?: Record<string, string>): TableColumn<T> => ({
    key,
    header: 'Status',
    width: 100,
    render: (value: unknown) => {
      const stringValue = String(value)
      const displayValue = statusMap?.[stringValue] ?? stringValue
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

      return createElement('span', {
        className: `px-2 py-1 text-xs rounded-full ${getStatusClasses(stringValue)}`
      }, displayValue)
    }
  }),

  currency: <T>(key: string, header: string, width?: number): TableColumn<T> => ({
    key,
    header,
    width: width ?? 120,
    align: 'right' as const,
    format: (value: unknown) => tableFormatters.currency(Number(value))
  }),

  date: <T>(key: string, header: string, width?: number): TableColumn<T> => ({
    key,
    header,
    width: width ?? 100,
    format: (value: unknown) => tableFormatters.date(value as Date | string)
  })
}



/**
 * Helper function to get nested object values
 * Returns unknown because we can't type-check dynamic string paths at compile time
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce(
    (current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key]
      }
      return undefined
    },
    obj
  )
}

// Table selection utilities
export function useTableSelection<T extends { id: number | string }>(data: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())

  const toggleSelect = (id: number | string) => {
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
      } 
        return new Set(data.map(item => item['id'])) // Select all
      
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const selectedItems = data.filter(item => selectedIds.has(item['id']))

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
  const [scrollTop, setScrollTop] = useState(0)

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
    onScroll: (event: UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop)
    }
  }
}
