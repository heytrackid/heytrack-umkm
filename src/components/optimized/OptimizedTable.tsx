'use client'
import * as React from 'react'

import { memo, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react'

// Memoized row component to prevent unnecessary re-renders
export const OptimizedTableRow = memo(({
  item,
  columns,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
  formatValue
}: {
  item: unknown
  columns: Array<{ key: string, label: string, render?: (value: unknown, item: unknown) => React.ReactNode }>
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit?: (item: unknown) => void
  onDelete?: (item: unknown) => void
  onView?: (item: unknown) => void
  formatValue?: (key: string, value: any, item: any) => React.ReactNode
}) => {
  const handleSelect = useCallback(() => {
    onSelect(item.id)
  }, [onSelect, item.id])

  const handleEdit = useCallback(() => {
    onEdit?.(item)
  }, [onEdit, item])

  const handleDelete = useCallback(() => {
    onDelete?.(item)
  }, [onDelete, item])

  const handleView = useCallback(() => {
    onView?.(item)
  }, [onView, item])

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelect}
        />
      </TableCell>
      {columns.map((column) => (
        <TableCell key={column.key}>
          {column.render 
            ? column.render(item[column.key], item)
            : formatValue 
              ? formatValue(column.key, item[column.key], item)
              : item[column.key]
          }
        </TableCell>
      ))}
      <TableCell>
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
})

OptimizedTableRow.displayName = 'OptimizedTableRow'

// Memoized bulk actions bar
export const BulkActionsBar = memo(({
  selectedCount,
  selectedItems,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  getPreviewNames
}: {
  selectedCount: number
  selectedItems: string[]
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  getPreviewNames: (items: string[]) => string
}) => {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {selectedCount} item dipilih
        </span>
        <span className="text-xs text-gray-500">
          ({getPreviewNames(selectedItems)})
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700"
        >
          Batal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkEdit}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Semua
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus Semua
        </Button>
      </div>
    </div>
  )
})

BulkActionsBar.displayName = 'BulkActionsBar'

// Main optimized table component
export const OptimizedTable = memo(({
  data,
  columns,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  onEdit,
  onDelete,
  onView,
  formatValue,
  emptyStateComponent,
  title,
  description
}: {
  data: unknown[]
  columns: Array<{ key: string, label: string, render?: (value: unknown, item: unknown) => React.ReactNode }>
  selectedItems: string[]
  onSelectAll: () => void
  onSelectItem: (id: string) => void
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  onEdit?: (item: unknown) => void
  onDelete?: (item: unknown) => void
  onView?: (item: unknown) => void
  formatValue?: (key: string, value: any, item: any) => React.ReactNode
  emptyStateComponent?: React.ReactNode
  title?: string
  description?: string
}) => {
  const isAllSelected = useMemo(() => 
    selectedItems.length === data.length && data.length > 0,
    [selectedItems.length, data.length]
  )

  const getPreviewNames = useCallback((items: string[]) => {
    const selectedData = data.filter(item => items.includes(item.id.toString()))
    const names = selectedData.map(item => item.name || item.title || item.id).slice(0, 2)
    return names.join(', ') + (items.length > 2 ? ` +${items.length - 2} lainnya` : '')
  }, [data])

  if (data.length === 0) {
    return emptyStateComponent || <div>Tidak ada data</div>
  }

  return (
    <div className="space-y-4">
      <BulkActionsBar
        selectedCount={selectedItems.length}
        selectedItems={selectedItems}
        onClearSelection={onClearSelection}
        onBulkEdit={onBulkEdit}
        onBulkDelete={onBulkDelete}
        getPreviewNames={getPreviewNames}
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead className="w-32">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <OptimizedTableRow
                key={item.id}
                item={item}
                columns={columns}
                isSelected={selectedItems.includes(item.id.toString())}
                onSelect={onSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                formatValue={formatValue}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})

OptimizedTable.displayName = 'OptimizedTable'