// @ts-nocheck - Generic type constraints
'use client'

import { type ReactNode, useState, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import {
  MoreHorizontal,
  Search,
  SortAsc,
  SortDesc,
  Trash2
} from 'lucide-react'
import { Input } from './input'

// Types for mobile table
export interface MobileTableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  accessor: keyof T | ((item: T) => ReactNode)
  sortable?: boolean
  width?: string
  className?: string
  render?: (value: unknown, item: T) => ReactNode
}

export interface MobileTableAction<T = Record<string, unknown>> {
  label: string
  icon?: ReactNode
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline'
  show?: (item: T) => boolean
}

interface MobileTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Array<MobileTableColumn<T>>
  actions?: Array<MobileTableAction<T>>
  onRowClick?: (item: T) => void
  loading?: boolean
  emptyMessage?: string
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  sortable?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  className?: string
  cardMode?: boolean // Show as cards instead of table on mobile
}

/**
 * MobileTable Component - Optimized with React.memo
 * 
 * Performance optimizations:
 * - Wrapped with React.memo to prevent unnecessary re-renders
 * - Custom comparison function for data prop
 * - useCallback for event handlers
 */
export const MobileTable = memo(({
  data,
  columns,
  actions = [],
  onRowClick,
  loading = false,
  emptyMessage,
  searchable = false,
  searchPlaceholder,
  onSearch,
  sortable = false,
  onSort,
  className,
  cardMode = true
}: MobileTableProps<T>) => {
  const { isMobile } = useResponsive()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSearch = useCallback((query: string) => {
    void setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  const handleSort = useCallback((key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    void setSortKey(key)
    void setSortDirection(newDirection)
    onSort?.(key, newDirection)
  }, [sortKey, sortDirection, onSort])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) { return data }

    return data.filter(item =>
      columns.some(col => {
        const value = typeof col.accessor === 'function'
          ? col.accessor(item)
          : item[col.accessor]

        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    )
  }, [data, columns, searchQuery])

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Render empty state
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            {emptyMessage || 'Tidak ada data'}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render search bar
  const renderSearchBar = () => {
    if (!searchable) { return null }

    return (
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder || 'Cari...'}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    )
  }

  // Render sort indicator
  const renderSortIndicator = (column: MobileTableColumn<T>) => {
    if (!sortable || !column.sortable) { return null }

    if (sortKey === column.key) {
      return sortDirection === 'asc' ?
        <SortAsc className="ml-1 h-4 w-4 inline" /> :
        <SortDesc className="ml-1 h-4 w-4 inline" />
    }

    return null
  }

  // Get cell value
  const getCellValue = (item: T, column: MobileTableColumn<T>) => {
    if (column.render) {
      const value = typeof column.accessor === 'function'
        ? column.accessor(item)
        : item[column.accessor]
      return column.render(value, item)
    }

    if (typeof column.accessor === 'function') {
      return column.accessor(item)
    }

    return item[column.accessor]
  }

  // Render card view for mobile
  const renderCardView = () => (
    <div className="space-y-4">
      {filteredData.map((item, index) => (
        <Card
          key={index}
          className={cn(
            "transition-all hover:shadow-md cursor-pointer",
            onRowClick && "hover:bg-gray-50"
          )}
          onClick={() => onRowClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground w-1/3">
                    {column.label}:
                  </span>
                  <div className={cn(
                    "text-sm flex-1 text-right truncate",
                    column.className
                  )} style={{ maxWidth: column.width }}>
                    {getCellValue(item, column)}
                  </div>
                </div>
              ))}

              {actions && actions.length > 0 && (
                <div className="flex gap-2 pt-3 border-t">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        Aksi
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions
                        .filter(action => !action.show || action.show(item))
                        .map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                            }}
                            className={cn(
                              action.variant === 'destructive' && "text-destructive"
                            )}
                          >
                            {action.icon && (
                              <span className="mr-2 h-4 w-4">
                                {action.icon}
                              </span>
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Render table view for desktop
  const renderTableView = () => (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  sortable && column.sortable && "cursor-pointer hover:bg-gray-100",
                  column.className
                )}
                onClick={() => sortable && column.sortable && handleSort(column.key)}
                style={{ width: column.width }}
              >
                <div className="flex items-center">
                  {column.label}
                  {renderSortIndicator(column)}
                </div>
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "hover:bg-gray-50",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm",
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {getCellValue(item, column)}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-4 py-3 text-right text-sm">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions
                        .filter(action => !action.show || action.show(item))
                        .map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                            }}
                            className={cn(
                              action.variant === 'destructive' && "text-destructive"
                            )}
                          >
                            {action.icon && (
                              <span className="mr-2 h-4 w-4">
                                {action.icon}
                              </span>
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className={cn(className)}>
      {renderSearchBar()}
      {isMobile && cardMode ? renderCardView() : renderTableView()}
    </div>
  )
}, (prevProps, nextProps) =>
// Custom comparison function for React.memo
(
  prevProps.data === nextProps.data &&
  prevProps.columns === nextProps.columns &&
  prevProps.actions === nextProps.actions &&
  prevProps.loading === nextProps.loading &&
  prevProps.emptyMessage === nextProps.emptyMessage &&
  prevProps.searchable === nextProps.searchable &&
  prevProps.searchPlaceholder === nextProps.searchPlaceholder &&
  prevProps.sortable === nextProps.sortable &&
  prevProps.cardMode === nextProps.cardMode
)
)

MobileTable.displayName = 'MobileTable'
