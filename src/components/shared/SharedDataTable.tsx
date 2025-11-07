'use client'

import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react'
import { type ReactNode, useEffect, useState, useMemo } from 'react'

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
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'
import { VirtualizedTable } from '@/components/ui/virtualized-table'

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
export const SharedDataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  onAdd,
  onView,
  onEdit,
  onDelete,
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
  enablePagination = true,
  pageSizeOptions,
  initialPageSize,
  className = "",
  compact = false
}: SharedDataTableProps<T>) => {
  // Hydration fix - prevent SSR/client mismatch
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

  // Computed values
  const sanitizedPageSizeOptions = useMemo(() => {
    if (!enablePagination) { return [Math.max(data.length, 1)] }
    if (pageSizeOptions && pageSizeOptions.length > 0) { return pageSizeOptions }
    return [10, 25, 50, 100]
  }, [enablePagination, pageSizeOptions, data.length])

  // Filter data (sorting not supported in VirtualizedTable)
  const processedData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || columns.some(col => {
        const value = getValue(item, col.key)
        return value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase())
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



  function handleFilterChange(columnKey: string, value: string) {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  function handleExport() {
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
  }

  // Reset pagination when filters change
  useEffect(() => {
    if (enablePagination) {
      void setCurrentPage(1)
    }
  }, [searchTerm, JSON.stringify(filters), rowsPerPage, enablePagination])

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
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
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
        <CardHeader className={compact ? 'p-4' : ''}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <CardTitle className={compact ? 'text-lg' : ''}>{title}</CardTitle>}
              {description && (
                <p className={`text-sm text-muted-foreground ${compact ? 'text-xs' : ''}`}>
                  {description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
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

      <CardContent className={compact ? 'p-4' : ''}>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <VirtualizedTable
              data={paginatedData}
              columns={columns.map(col => {
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
              }).concat(onView || onEdit || onDelete ? [{
                header: 'Actions',
                accessor: 'actions' as keyof T,
                cell: (item: T) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
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
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }] : [])}
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
