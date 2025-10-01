'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  ChevronRight,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from"@/components/ui/dropdown-menu"
import { useResponsive } from '@/hooks/use-mobile'
import { Input } from './input'

// Types for mobile table
export interface MobileTableColumn<T = any> {
  key: string
  label: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  sortable?: boolean
  width?: string
  className?: string
  render?: (value: any, item: T) => React.ReactNode
}

export interface MobileTableAction<T = any> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline'
  show?: (item: T) => boolean
}

interface MobileTableProps<T = any> {
  data: T[]
  columns: MobileTableColumn<T>[]
  actions?: MobileTableAction<T>[]
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

export function MobileTable<T extends Record<string, any>>({
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
}: MobileTableProps<T>) {
  const { isMobile } = useResponsive()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)
    onSort?.(key, newDirection)
  }

  const getValue = (item: T, column: MobileTableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item)
    }
    return item[column.accessor]
  }

  const renderValue = (item: T, column: MobileTableColumn<T>) => {
    const value = getValue(item, column)
    if (column.render) {
      return column.render(value, item)
    }
    return value
  }

  // Mobile Card View
  const MobileCardView = () => (
    <div className="space-y-3">
      {data.map((item, index: number) => (
        <Card 
          key={index}
          className={cn(
           "transition-colors",
            onRowClick &&"cursor-pointer hover:bg-accent"
          )}
          onClick={() => onRowClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Primary column (first column) */}
              {columns[0] && (
                <div className="flex items-center justify-between">
                  <div className="font-medium text-base">
                    {renderValue(item, columns[0])}
                  </div>
                  {actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => {
                          if (action.show && !action.show(item)) return null
                          return (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(item)
                              }}
                              className={action.variant === 'destructive' ? 'text-gray-600 dark:text-gray-400' : ''}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
              
              {/* Secondary columns */}
              {columns.slice(1).map((column, colIndex) => (
                <div key={colIndex} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{column.label}:</span>
                  <span className="font-medium">{renderValue(item, column)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Desktop Table View
  const DesktopTableView = () => (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column, index: number) => (
              <th
                key={index}
                className={cn(
                 "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                  column.className,
                  column.sortable && sortable &&"cursor-pointer hover:text-foreground"
                )}
                style={{ width: column.width }}
                onClick={() => {
                  if (column.sortable && sortable) {
                    handleSort(column.key)
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <span>{column.label}</span>
                  {column.sortable && sortable && (
                    <div className="flex flex-col">
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && (
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-20">
                Informasi
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index: number) => (
            <tr
              key={index}
              className={cn(
               "border-b transition-colors hover:bg-muted/50",
                onRowClick &&"cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                   "p-4 align-middle",
                    column.className
                  )}
                >
                  {renderValue(item, column)}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="p-4 align-middle text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, actionIndex) => {
                        if (action.show && !action.show(item)) return null
                        return (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                            }}
                            className={action.variant === 'destructive' ? 'text-gray-600 dark:text-gray-400' : ''}
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </DropdownMenuItem>
                        )
                      })}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Informasi</div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Bar */}
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || "Cari..."}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Additional filter buttons can be added here */}
        </div>
      )}

      {/* Table Content */}
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage || Informasi}
        </div>
      ) : (
        <>
          {isMobile && cardMode ? <MobileCardView /> : <DesktopTableView />}
        </>
      )}
    </div>
  )
}

// Predefined cell renderers for common data types
export const TableRenderers = {
  currency: (value: number) => (
    <span className="font-medium">
      Rp {value?.toLocaleString('id-ID') || '0'}
    </span>
  ),
  
  status: (value: string, colorMap?: Record<string, string>) => (
    <Badge 
      variant="secondary"
      className={colorMap?.[value] || ''}
    >
      {value}
    </Badge>
  ),
  
  date: (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value)
    return (
      <span className="text-sm">
        {date.toLocaleDateString('id-ID')}
      </span>
    )
  },
  
  boolean: (value: boolean) => (
    <Badge variant={value ?"default" :"secondary"}>
      {value ? Informasi : Informasi}
    </Badge>
  ),
  
  stock: (current: number, min: number) => (
    <div className="space-y-1">
      <div className="font-medium">{current}</div>
      {current <= min && (
        <Badge variant="destructive" className="text-xs">
          Informasi
        </Badge>
      )}
    </div>
  )
}

// Common action sets
export const createCommonActions = {
  crud: <T,>(
    onEdit: (item: T) => void,
    onDelete: (item: T) => void,
    onView?: (item: T) => void
  ): MobileTableAction<T>[] => [
    ...(onView ? [{
      label: Informasi,
      icon: <Eye className="h-4 w-4" />,
      onClick: onView
    }] : []),
    {
      label: Informasi,
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit
    },
    {
      label: Informasi,
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive' as const
    }
  ]
}
