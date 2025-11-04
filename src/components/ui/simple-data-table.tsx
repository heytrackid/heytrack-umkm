 
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'
import { VirtualizedTable } from '@/components/ui/virtualized-table'
import { useMobile } from '@/hooks/useResponsive'
import {
    Download,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    Search,
    Trash2
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

type SortableValue = string | number | boolean | Date | null | undefined

export interface SimpleColumn<T, TValue = unknown> {
  key: keyof T
  header: string
  accessor?: (item: T) => TValue
  render?: (value: TValue, item: T) => ReactNode
  sortable?: boolean
  sortAccessor?: (item: T) => SortableValue
  filterable?: boolean
  filterType?: 'text' | 'select'
  filterOptions?: Array<{ label: string; value: string }>
  hideOnMobile?: boolean
}

interface SimpleDataTableProps<T, TValue = unknown> {
  title?: string
  description?: string
  data: T[]
  columns: Array<SimpleColumn<T, TValue>>
  searchPlaceholder?: string
  onAdd?: () => void
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  addButtonText?: string
  emptyMessage?: string
  exportData?: boolean
  loading?: boolean
  enablePagination?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
}

// Create actions cell renderer outside component to avoid unstable nested components
const createActionsCell = <T extends Record<string, unknown>>(
  onView?: (item: T) => void,
  onEdit?: (item: T) => void,
  onDelete?: (item: T) => void
) => {
  if (!onView && !onEdit && !onDelete) {
    return undefined
  }

  return (item: T) => (
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
}

export const SimpleDataTable = <T extends Record<string, unknown>, TValue = T[keyof T]>({
  title,
  description,
  data,
  columns,
  searchPlaceholder,
  onAdd,
  onView,
  onEdit,
  onDelete,
  addButtonText,
  emptyMessage,
  exportData = false,
  loading = false,
  enablePagination = true,
  pageSizeOptions,
  initialPageSize
}: SimpleDataTableProps<T, TValue>) => {
  const { isMobile } = useMobile()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const sanitizedPageSizeOptions = useMemo(() => {
    if (!enablePagination) { return [Math.max(data.length, 1)] }
    if (pageSizeOptions && pageSizeOptions.length > 0) { return pageSizeOptions }
    return [10, 25, 50]
  }, [enablePagination, pageSizeOptions, data.length])

  const sanitizedInitialPageSize = useMemo(() => {
    if (!enablePagination) { return Math.max(data.length, 1) }
    if (initialPageSize && sanitizedPageSizeOptions.includes(initialPageSize)) {
      return initialPageSize
    }
    return sanitizedPageSizeOptions[0]
  }, [enablePagination, initialPageSize, sanitizedPageSizeOptions, data.length])

  const [rowsPerPage, setRowsPerPage] = useState<number>(sanitizedInitialPageSize)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data berdasarkan search dan filter
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = !searchTerm || columns.some(col => {
      const value = getColumnValue(item, col)
      return value !== null && String(value).toLowerCase().includes(searchLower)
    })

    const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || filterValue === 'all') { return true }
      const column = columns.find(col => String(col.key) === key)
      if (!column) { return true }
      const itemValue = getColumnValue(item, column)
      return String(itemValue ?? '') === filterValue
    })

    return matchesSearch && matchesFilters
  })

  // Note: Sorting is not supported in VirtualizedTable, data is displayed as-is
  const sortedData = filteredData

  const totalItems = sortedData.length
  const totalPages = enablePagination ? Math.max(1, Math.ceil(totalItems / rowsPerPage)) : 1
  const pageStart = enablePagination ? ((currentPage - 1) * rowsPerPage) + 1 : 1
  const pageEnd = enablePagination
    ? Math.min(pageStart + rowsPerPage - 1, totalItems)
    : totalItems
  const paginatedData = enablePagination
    ? sortedData.slice(pageStart - 1, pageEnd)
    : sortedData

  function getColumnValue(item: T, column: SimpleColumn<T, TValue>): TValue {
    if (column.accessor) {
      return column.accessor(item)
    }
    return item[column.key] as TValue
  }

  useEffect(() => {
    if (!enablePagination) { return }
    void setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, JSON.stringify(filters), rowsPerPage, enablePagination])

  useEffect(() => {
    if (!enablePagination) { return }
    const maxPage = Math.max(1, Math.ceil(totalItems / rowsPerPage))
    if (currentPage > maxPage) {
      void setCurrentPage(maxPage)
    }
  }, [currentPage, rowsPerPage, totalItems, enablePagination])

  useEffect(() => {
    if (!enablePagination) { return }
    if (!sanitizedPageSizeOptions.includes(rowsPerPage)) {
      void setRowsPerPage(sanitizedInitialPageSize)
    }
  }, [rowsPerPage, sanitizedInitialPageSize, sanitizedPageSizeOptions, enablePagination])

  function handleFilterChange(columnKey: string, value: string) {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  function handleExport() {
    if (!exportData) { return }

    const csvContent = [
      columns.map(col => col.header).join(','),
      ...sortedData.map(item =>
        columns.map(col => {
          const value = getColumnValue(item, col)
          return `"${String(value ?? '')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Create cell renderers outside render to avoid component creation during render
  const createCellRenderer = (col: SimpleColumn<T, TValue>) => {
    if (col.render) {
      return (item: T) => {
        const value = getColumnValue(item, col)
        return col.render ? col.render(value, item) : String(value)
      }
    }
    return undefined
  }



  // Convert columns to VirtualizedTable format
  const virtualizedColumns = columns.map(col => ({
    header: col.header,
    accessor: col.key,
    cell: createCellRenderer(col)
  }))

  // Add actions column if needed
  const actionsCell = createActionsCell(onView, onEdit, onDelete)
  if (actionsCell) {
    virtualizedColumns.push({
      header: 'Actions',
      accessor: 'actions' as keyof T,
      cell: actionsCell
    })
  }

  if (loading) {
    return (
      <Card>
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
    <Card>
      {/* Header */}
      {(title ?? onAdd) && (
        <CardHeader className={isMobile ? 'p-4' : ''}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-4'}`}>
            <div>
              {title && <CardTitle className={isMobile ? 'text-lg' : ''}>{title}</CardTitle>}
              {description && <p className={`text-sm text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>{description}</p>}
            </div>
            <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
              {exportData && (
                <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={handleExport} className={isMobile ? 'flex-1' : ''}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {onAdd && (
                <Button onClick={onAdd} size={isMobile ? "sm" : "default"} className={isMobile ? 'flex-1' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  {addButtonText ?? "Add Data"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={isMobile ? 'p-4' : ''}>
        {/* Search and Filters */}
        <div className={`${isMobile ? 'space-y-3' : 'flex flex-col sm:flex-row gap-4'} mb-6`}>
          {/* Search */}
          <div className={`relative ${isMobile ? 'w-full' : 'flex-1'}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder ?? "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              size={isMobile ? 14 : 14}
            />
          </div>

          {/* Column Filters */}
          {columns.filter(col => col.filterable && col.filterOptions).length > 0 && (
            <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'flex gap-2'}`}>
              {columns
                .filter(col => col.filterable && col.filterOptions)
                .map(col => (
                  <Select
                    key={String(col.key)}
                    value={filters[String(col.key)] || 'all'}
                    onValueChange={(value) => handleFilterChange(String(col.key), value)}
                  >
                    <SelectTrigger className={isMobile ? 'w-full' : 'w-[150px]'}>
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
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{emptyMessage ?? "No data available"}</p>
          </div>
        ) : (
          <VirtualizedTable
            data={paginatedData}
            columns={virtualizedColumns}
            className="border rounded-lg"
          />
        )}

        {/* Pagination Controls */}
        {enablePagination && totalItems > 0 && (
          <div className="mt-4 border-t pt-4">
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
      </CardContent>
    </Card>
  )
}
