'use client'

import {
    Download,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    Trash2
} from '@/components/icons'
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonText } from '@/components/ui/skeleton'
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'
import { VirtualizedTable } from '@/components/ui/virtualized-table'
import { cn } from '@/lib/utils'

/* eslint-disable */

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (value: unknown, item: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select'
  filterOptions?: Array<{ label: string; value: string }>
  hideOnMobile?: boolean
  className?: string
}

interface SharedDataTableProps<T> {
  // Data
  data: T[]
  columns: Array<Column<T>>

  // Actions
  onAdd?: () => void
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onBulkDelete?: (items: T[]) => void
  onRefresh?: () => void

  // Configuration
  title?: string
  description?: string
  addButtonText?: string
  searchPlaceholder?: string
  emptyMessage?: string
  emptyDescription?: string
  loading?: boolean
  exportable?: boolean
  refreshable?: boolean
  enableBulkActions?: boolean

  // Pagination
  enablePagination?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number

  // Styling
  className?: string
  compact?: boolean
}

/**
 * Shared Data Table Component
 *
 * A comprehensive, reusable data table with:
 * - Search and filtering
 * - Sorting
 * - Pagination
 * - Export functionality
 * - Mobile responsive design
 * - CRUD actions
 */
const SharedDataTableComponent = <T extends Record<string, unknown>>({
  data,
  columns,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onRefresh,
  title,
  description,
  addButtonText = "Tambah Data",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada data",
  emptyDescription = "Belum ada data yang tersedia",
  loading = false,
  exportable = false,
  refreshable = true,
  enableBulkActions = false,
  enablePagination = true,
  pageSizeOptions,
  initialPageSize,
  className = "",
  compact = false
}: SharedDataTableProps<T>) => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    initialPageSize || pageSizeOptions?.[0] || 10
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Computed values
  const sanitizedPageSizeOptions = useMemo(() => {
    if (!enablePagination) { return [Math.max(data.length, 1)] }
    if (pageSizeOptions && pageSizeOptions.length > 0) { return pageSizeOptions }
    return [10, 25, 50, 100]
  }, [enablePagination, pageSizeOptions, data.length])

  // Filter data (sorting not supported in VirtualizedTable)
  const processedData = useMemo(() => {
    // Safety check: ensure data is an array
    const safeData = Array.isArray(data) ? data : []
    
    return safeData.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || columns.some(col => {
        const value = getValue(item, col.key)
        return value !== null && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue || filterValue === 'all') { return true }
        const itemValue = getValue(item, key)
        return String(itemValue) === filterValue
      })

      return matchesSearch && matchesFilters
    })
  }, [data, searchTerm, filters, columns])

  // Pagination
  const totalItems = processedData.length
  const totalPages = enablePagination ? Math.max(1, Math.ceil(totalItems / rowsPerPage)) : 1
  const pageStart = enablePagination ? ((currentPage - 1) * rowsPerPage) + 1 : 1
  const pageEnd = enablePagination
    ? Math.min(pageStart + rowsPerPage - 1, totalItems)
    : totalItems
  const paginatedData = enablePagination
    ? processedData.slice(pageStart - 1, pageEnd)
    : processedData

  // Utility functions
  function getValue(item: T, key: keyof T | string): unknown {
    if (typeof key === 'string' && key.includes('.')) {
      return key
        .split('.')
        .reduce<unknown>((acc, segment) => {
          if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[segment]
          }
          return undefined
        }, item as Record<string, unknown>)
    }
    return item[key as keyof T]
  }



  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }, [])

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set())
    } else {
      const allIds = new Set(paginatedData.map(item => String(item['id'])))
      setSelectedItems(allIds)
    }
  }, [paginatedData, selectedItems.size])

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (!onBulkDelete || selectedItems.size === 0) return
    
    const itemsToDelete = paginatedData.filter(item => selectedItems.has(String(item['id'])))
    onBulkDelete(itemsToDelete)
    setSelectedItems(new Set())
  }, [onBulkDelete, paginatedData, selectedItems])

  const handleExport = useCallback(() => {
    if (!exportable) { return }

    const csvContent = [
      columns.map(col => col.header).join(','),
      ...processedData.map(item =>
        columns.map(col => {
          const value = getValue(item, col.key)
          return `"${String(value || '')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${title || 'data'}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document['body'].appendChild(link)
    link.click()
    document['body'].removeChild(link)
  }, [exportable, processedData, columns, title])

  // Memoize filters for efficient dependency comparison
  const memoizedFilters = useMemo(() => JSON.stringify(filters), [filters])

  // Reset pagination when filters change
  useEffect(() => {
    if (enablePagination) {
      void setCurrentPage(1)
    }
  }, [searchTerm, memoizedFilters, rowsPerPage, enablePagination])

  // Reset to valid page when data changes
  useEffect(() => {
    if (enablePagination && currentPage > totalPages) {
      void setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages, enablePagination])

  // Prevent hydration mismatch
  if (!isMounted || loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <SkeletonText className="h-4 w-1/4" />
            {[...Array(5)].map((_, i) => (
              <SkeletonText key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {/* Header */}
      {(title || onAdd || refreshable) && (
        <CardHeader className={cn(compact && "p-4")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <CardTitle className={cn(compact && "text-lg")}>{title}</CardTitle>}
              {description && (
                <p className={cn("text-sm text-muted-foreground", compact && "text-xs")}>
                  {description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {enableBulkActions && selectedItems.size > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus {selectedItems.size} item
                </Button>
              )}
              {refreshable && onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {exportable && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {onAdd && (
                <Button onClick={onAdd} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {addButtonText}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(compact && "p-4")}>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Column Filters */}
          {columns.filter(col => col.filterable && col.filterOptions).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {columns
                .filter(col => col.filterable && col.filterOptions)
                .map(col => (
                  <Select
                    key={String(col.key)}
                    value={filters[String(col.key)] || 'all'}
                    onValueChange={(value) => handleFilterChange(String(col.key), value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={`Filter ${col.header}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {col.header}</SelectItem>
                      {col.filterOptions?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
            </div>
          )}
        </div>

        {/* Virtualized Table */}
        {processedData.length === 0 ? (
          onAdd ? (
            <EmptyState
              title={emptyMessage}
              description={emptyDescription}
              actions={[{ label: addButtonText, onClick: onAdd }]}
            />
          ) : (
            <EmptyState
              title={emptyMessage}
              description={emptyDescription}
            />
          )
        ) : (
          <div className="space-y-4">
            {enableBulkActions && (
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="cursor-pointer w-4 h-4"
                  />
                  <span className="text-sm text-muted-foreground">
                    Pilih semua ({paginatedData.length})
                  </span>
                </label>
                {selectedItems.size > 0 && (
                  <div className="flex-1 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedItems.size} item dipilih
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedItems(new Set())}
                      >
                        Batal
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <VirtualizedTable
              data={paginatedData}
              columns={([
                ...(enableBulkActions ? [{
                  header: '☑',
                  accessor: 'select' as keyof T,
                  cell: (item: T) => (
                    <input
                      type="checkbox"
                      checked={selectedItems.has(String(item['id']))}
                      onChange={() => handleSelectItem(String(item['id']))}
                      className="cursor-pointer w-4 h-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )
                }] : []),
                ...columns.map(col => {
                  const base = {
                    header: col.header,
                    accessor: col.key,
                  }
                  if (col.render) {
                    return {
                      ...base,
                      cell: (item: T) => {
                        const value = getValue(item, col.key)
                        return col.render!(value, item)
                      }
                    }
                  }
                  return base
                }),
                ...(onView || onEdit || onDelete ? [{
                header: 'Aksi',
                accessor: 'actions' as keyof T,
                cell: (item: T) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }] : [])
              ] as any)}
              className="border rounded-lg"
            />

            {/* Pagination */}
            {enablePagination && totalItems > 0 && (
              <div className="border-t pt-4">
                <TablePaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={rowsPerPage}
                  onPageSizeChange={(size) => {
                    void setRowsPerPage(size)
                    void setCurrentPage(1)
                  }}
                  totalItems={totalItems}
                  pageStart={pageStart}
                  pageEnd={pageEnd}
                  pageSizeOptions={sanitizedPageSizeOptions}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Memoized export for performance
export const SharedDataTable = memo(SharedDataTableComponent) as typeof SharedDataTableComponent
