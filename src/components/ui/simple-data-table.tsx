'use client'

import { useState } from 'react'
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
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
}

export function SimpleDataTable<T extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  searchPlaceholder = "Cari data...",
  onAdd,
  onView,
  onEdit,
  onDelete,
  addButtonText = "Tambah",
  emptyMessage = "Tidak ada data tersedia",
  exportData = false,
  loading = false
}: SimpleDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter data berdasarkan search dan filter
  const filteredData = data.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm || 
      columns.some(col => {
        const value = getValue(item, col.key)
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
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

  function getValue(item: T, key: keyof T | string): any {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item)
    }
    return item[key as keyof T]
  }

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
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex gap-2">
              {exportData && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {onAdd && (
                <Button onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  {addButtonText}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Column Filters */}
          <div className="flex gap-2">
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
                    <SelectItem value="all">Semua {col.header}</SelectItem>
                    {col.filterOptions?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
          </div>
        </div>

        {/* Table */}
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
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
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
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
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}