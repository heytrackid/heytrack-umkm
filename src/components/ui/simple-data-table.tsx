'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMobileFirst } from '@/hooks/use-responsive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from"@/components/ui/select"
import { TablePaginationControls } from '@/components/ui/table-pagination-controls'

interface SimpleColumn<T> {
  key: keyof T | string
  header: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select'
  filterOptions?: { label: string; value: string }[]
  hideOnMobile?: boolean
}

interface SimpleDataTableProps<T> {
  title?: string
  description?: string
  data: T[]
  columns: SimpleColumn<T>[]
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

export function SimpleDataTable<T extends Record<string, any>>({
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
}: SimpleDataTableProps<T>) {
  const { isMobile, shouldUseCompactUI } = useMobileFirst()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sanitizedPageSizeOptions = useMemo(() => {
    if (!enablePagination) return [Math.max(data.length, 1)]
    if (pageSizeOptions && pageSizeOptions.length > 0) return pageSizeOptions
    return [10, 25, 50]
  }, [enablePagination, pageSizeOptions, data.length])

  const sanitizedInitialPageSize = useMemo(() => {
    if (!enablePagination) return Math.max(data.length, 1)
    if (initialPageSize && sanitizedPageSizeOptions.includes(initialPageSize)) {
      return initialPageSize
    }
    return sanitizedPageSizeOptions[0]
  }, [enablePagination, initialPageSize, sanitizedPageSizeOptions, data.length])

  const [rowsPerPage, setRowsPerPage] = useState<number>(sanitizedInitialPageSize)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data berdasarkan search dan filter
  const filteredData = data.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm || 
      columns.some(col => {
        const value = getValue(item, col.key)
        return value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })

    // Column filters
    const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue || filterValue === 'all') return true
      const itemValue = getValue(item, key)
      return String(itemValue) === filterValue
    })

    return matchesSearch && matchesFilters
  })

  // Sort data
  const sortedData = sortBy ? [...filteredData].sort((a, b) => {
    const aVal = getValue(a, sortBy)
    const bVal = getValue(b, sortBy)
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  }) : filteredData

  const totalItems = sortedData.length
  const totalPages = enablePagination ? Math.max(1, Math.ceil(totalItems / rowsPerPage)) : 1
  const pageStart = enablePagination ? ((currentPage - 1) * rowsPerPage) + 1 : 1
  const pageEnd = enablePagination
    ? Math.min(pageStart + rowsPerPage - 1, totalItems)
    : totalItems
  const paginatedData = enablePagination
    ? sortedData.slice(pageStart - 1, pageEnd)
    : sortedData

  function getValue(item: T, key: keyof T | string): any {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item)
    }
    return item[key as keyof T]
  }

  useEffect(() => {
    if (!enablePagination) return
    setCurrentPage(1)
  }, [searchTerm, JSON.stringify(filters), sortBy, sortOrder, rowsPerPage, enablePagination])

  useEffect(() => {
    if (!enablePagination) return
    const maxPage = Math.max(1, Math.ceil(totalItems / rowsPerPage))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, rowsPerPage, totalItems, enablePagination])

  useEffect(() => {
    if (!enablePagination) return
    if (!sanitizedPageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(sanitizedInitialPageSize)
    }
  }, [rowsPerPage, sanitizedInitialPageSize, sanitizedPageSizeOptions, enablePagination])

  function handleSort(columnKey: string) {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnKey)
      setSortOrder('asc')
    }
  }

  function handleFilterChange(columnKey: string, value: string) {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  function handleExport() {
    if (!exportData) return
    
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...sortedData.map(item => 
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
    link.setAttribute('download', `data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {/* Header */}
      {(title || onAdd) && (
        <CardHeader className={shouldUseCompactUI ? 'p-4' : ''}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-4'}`}>
            <div>
              {title && <CardTitle className={isMobile ? 'text-lg' : ''}>{title}</CardTitle>}
              {description && <p className={`text-sm text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>{description}</p>}
            </div>
            <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
              {exportData && (
                <Button variant="outline" size={isMobile ?"sm" :"sm"} onClick={handleExport} className={isMobile ? 'flex-1' : ''}>
                  <Download className="h-4 w-4 mr-2" />
                  Informasi
                </Button>
              )}
              {onAdd && (
                <Button onClick={onAdd} size={isMobile ?"sm" :"default"} className={isMobile ? 'flex-1' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  {addButtonText || Informasi}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={shouldUseCompactUI ? 'p-4' : ''}>
        {/* Search and Filters */}
        <div className={`${isMobile ? 'space-y-3' : 'flex flex-col sm:flex-row gap-4'} mb-6`}>
          {/* Search */}
          <div className={`relative ${isMobile ? 'w-full' : 'flex-1'}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || Informasi}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              size={isMobile ? 'default' : 'default'}
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
                      <SelectItem value="all">Informasi {col.header}</SelectItem>
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

        {/* Table / Mobile Cards */}
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{emptyMessage || Informasi}</p>
          </div>
        ) : isMobile ? (
          /* Mobile Card Layout */
          <div className="space-y-4">
            <div className="space-y-3">
              {paginatedData.map((item, index: number) => (
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
                        ))
                      }
                      
                      {(onView || onEdit || onDelete) && (
                        <div className="flex gap-2 pt-3 border-t">
                          {onView && (
                            <Button variant="outline" size="sm" onClick={() => onView(item)} className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              Informasi
                            </Button>
                          )}
                          {onEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Informasi
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="outline" size="sm" onClick={() => onDelete(item)} className="flex-1 text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Informasi
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {enablePagination && totalItems > 0 && (
              <TablePaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={rowsPerPage}
                onPageSizeChange={(size) => {
                  setRowsPerPage(size)
                  setCurrentPage(1)
                }}
                totalItems={totalItems}
                pageStart={pageStart}
                pageEnd={pageEnd}
                pageSizeOptions={sanitizedPageSizeOptions}
                className="border-t"
              />
            )}
          </div>
        ) : (
          /* Desktop Table Layout */
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map(col => (
                      <th
                        key={String(col.key)}
                        className={`text-left p-2 font-medium text-muted-foreground ${
                          col.hideOnMobile ? 'hidden sm:table-cell' : ''
                        }`}
                      >
                        {col.sortable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium"
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
                      <th className="text-right p-2 font-medium text-muted-foreground">
                        Informasi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {columns.map(col => (
                        <td
                          key={String(col.key)}
                          className={`p-2 ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                        >
                          {col.render 
                            ? col.render(getValue(item, col.key), item)
                            : String(getValue(item, col.key) || '-')
                          }
                        </td>
                      ))}
                      {(onView || onEdit || onDelete) && (
                        <td className="text-right p-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Informasi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {onView && (
                                <DropdownMenuItem onClick={() => onView(item)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Informasi
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Informasi
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem 
                                  onClick={() => onDelete(item)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Informasi
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

            {enablePagination && totalItems > 0 && (
              <TablePaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={rowsPerPage}
                onPageSizeChange={(size) => {
                  setRowsPerPage(size)
                  setCurrentPage(1)
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