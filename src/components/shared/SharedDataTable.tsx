'use client'

import { type ReactNode, useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'
import { EmptyState } from '@/components/ui/empty-state'

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
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
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

  const _sanitizedInitialPageSize = useMemo(() => {
    if (!enablePagination) { return Math.max(data.length, 1) }
    if (initialPageSize && sanitizedPageSizeOptions.includes(initialPageSize)) {
      return initialPageSize
    }
    return sanitizedPageSizeOptions[0]
  }, [enablePagination, initialPageSize, sanitizedPageSizeOptions, data.length])

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm ||
        columns.some(col => {
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

    // Sort data
    if (sortBy) {
      filtered = filtered.sort((a, b) => {
        const aVal = getValue(a, sortBy)
        const bVal = getValue(b, sortBy)

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          if (aVal < bVal) { return sortOrder === 'asc' ? -1 : 1 }
          if (aVal > bVal) { return sortOrder === 'asc' ? 1 : -1 }
          return 0
        }

        const aText = String(aVal ?? '')
        const bText = String(bVal ?? '')
        if (aText < bText) { return sortOrder === 'asc' ? -1 : 1 }
        if (aText > bText) { return sortOrder === 'asc' ? 1 : -1 }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, filters, sortBy, sortOrder, columns])

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

  function handleSort(columnKey: string) {
    if (sortBy === columnKey) {
      void setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      void setSortBy(columnKey)
      void setSortOrder('asc')
    }
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
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset pagination when filters change
  useEffect(() => {
    if (enablePagination) {
      void setCurrentPage(1)
    }
  }, [searchTerm, JSON.stringify(filters), sortBy, sortOrder, rowsPerPage, enablePagination])

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

        {/* Table */}
        {processedData.length === 0 ? (
          <EmptyState
            title={emptyMessage}
            description={emptyDescription}
            action={onAdd ? { label: addButtonText, onClick: onAdd } : undefined}
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map(col => (
                      <th
                        key={String(col.key)}
                        className={`text-left p-3 font-medium text-muted-foreground ${col.hideOnMobile ? 'hidden lg:table-cell' : ''
                          } ${col.className || ''}`}
                      >
                        {col.sortable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium hover:bg-transparent"
                            onClick={() => handleSort(String(col.key))}
                          >
                            {col.header}
                            {sortBy === String(col.key) && (
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </Button>
                        ) : (
                          col.header
                        )}
                      </th>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <th className="text-right p-3 font-medium text-muted-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {columns.map(col => (
                        <td
                          key={String(col.key)}
                          className={`p-3 ${col.hideOnMobile ? 'hidden lg:table-cell' : ''} ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(getValue(item, col.key), item)
                            : String(getValue(item, col.key) || '-')
                          }
                        </td>
                      ))}
                      {(onView || onEdit || onDelete) && (
                        <td className="text-right p-3">
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
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {paginatedData.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {columns
                        .filter(col => !col.hideOnMobile)
                        .map(col => (
                          <div key={String(col.key)} className="flex justify-between items-start">
                            <span className="text-sm font-medium text-muted-foreground w-1/3">
                              {col.header}:
                            </span>
                            <div className="text-sm flex-1 text-right">
                              {col.render
                                ? col.render(getValue(item, col.key), item)
                                : String(getValue(item, col.key) || '-')
                              }
                            </div>
                          </div>
                        ))}

                      {(onView || onEdit || onDelete) && (
                        <div className="flex gap-2 pt-3 border-t">
                          {onView && (
                            <Button variant="outline" size="sm" onClick={() => onView(item)} className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                          {onEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="outline" size="sm" onClick={() => onDelete(item)} className="flex-1 text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {enablePagination && totalItems > 0 && (
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
                className="border-t"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
