'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter } from 'lucide-react'

// Row component for virtualized rendering
const VirtualizedRow = React.memo(({ 
  index, 
  style, 
  data 
}: {
  index: number
  style: React.CSSProperties
  data: {
    items: any[]
    columns: Array<{ key: string, label: string, render?: (value: any, item: any) => React.ReactNode }>
    selectedItems: string[]
    onSelectItem: (id: string) => void
    formatValue?: (key: string, value: any, item: any) => React.ReactNode
  }
}) => {
  const { items, columns, selectedItems, onSelectItem, formatValue } = data
  const item = items[index]
  
  const handleSelect = useCallback(() => {
    onSelectItem(item.id.toString())
  }, [onSelectItem, item.id])

  return (
    <div style={style} className="flex border-b hover:bg-gray-50">
      <div className="w-12 p-2 flex items-center justify-center">
        <Checkbox
          checked={selectedItems.includes(item.id.toString())}
          onCheckedChange={handleSelect}
        />
      </div>
      {columns.map((column, colIndex) => (
        <div 
          key={column.key} 
          className="flex-1 p-2 flex items-center text-sm"
          style={{ minWidth: '120px' }}
        >
          {column.render 
            ? column.render(item[column.key], item)
            : formatValue 
              ? formatValue(column.key, item[column.key], item)
              : item[column.key] || '-'
          }
        </div>
      ))}
    </div>
  )
})

VirtualizedRow.displayName = 'VirtualizedRow'

// Main virtualized table component for large datasets
export const VirtualizedTable = React.memo(({
  data,
  columns,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  formatValue,
  height = 400,
  rowHeight = 50,
  searchable = true,
  filterable = true
}: {
  data: any[]
  columns: Array<{ key: string, label: string, render?: (value: any, item: any) => React.ReactNode }>
  selectedItems?: string[]
  onSelectAll?: () => void
  onSelectItem?: (id: string) => void
  formatValue?: (key: string, value: any, item: any) => React.ReactNode
  height?: number
  rowHeight?: number
  searchable?: boolean
  filterable?: boolean
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = item[column.key]
          return value && value.toString().toLowerCase().includes(searchLower)
        })
      )
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, columns])

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  // Data for react-window
  const listData = useMemo(() => ({
    items: filteredData,
    columns,
    selectedItems,
    onSelectItem: onSelectItem || (() => {}),
    formatValue
  }), [filteredData, columns, selectedItems, onSelectItem, formatValue])

  const isAllSelected = useMemo(() => 
    selectedItems.length === filteredData.length && filteredData.length > 0,
    [selectedItems.length, filteredData.length]
  )

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {searchTerm ? 'Tidak ada hasil pencarian' : 'Tidak ada data'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      {(searchable || filterable) && (
        <div className="flex gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
        </div>
      )}

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredData.length} dari {data.length} data
        {selectedItems.length > 0 && ` • ${selectedItems.length} dipilih`}
      </div>

      {/* Virtual table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex bg-gray-50 border-b font-medium text-sm">
          <div className="w-12 p-2 flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
            />
          </div>
          {columns.map((column) => (
            <div 
              key={column.key}
              className="flex-1 p-2 flex items-center cursor-pointer hover:bg-gray-100"
              style={{ minWidth: '120px' }}
              onClick={() => handleSort(column.key)}
            >
              <span>{column.label}</span>
              {sortConfig?.key === column.key && (
                <span className="ml-1">
                  {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Virtualized rows */}
        <List
          height={height}
          itemCount={filteredData.length}
          itemSize={rowHeight}
          itemData={listData}
        >
          {VirtualizedRow}
        </List>
      </div>
    </div>
  )
})

VirtualizedTable.displayName = 'VirtualizedTable'

// Hook for managing large table state
export const useVirtualizedTable = (
  data: any[],
  options?: {
    pageSize?: number
    defaultSort?: { key: string, direction: 'asc' | 'desc' }
  }
) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === data.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(data.map(item => item.id.toString()))
    }
  }, [selectedItems.length, data])

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const getSelectedData = useCallback(() => {
    return data.filter(item => selectedItems.includes(item.id.toString()))
  }, [data, selectedItems])

  return {
    selectedItems,
    selectedData: getSelectedData(),
    currentPage,
    setCurrentPage,
    handleSelectAll,
    handleSelectItem,
    clearSelection
  }
}