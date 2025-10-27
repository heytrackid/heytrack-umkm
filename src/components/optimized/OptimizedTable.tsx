'use client'

import { type ReactNode, memo, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react'

// Define types
interface ColumnDefinition<T> {
  key: keyof T | string
  label: string
  render?: (value: unknown, item: T) => ReactNode
}

interface OptimizedTableRowProps<T extends { id: string | number }> {
  item: T
  columns: Array<ColumnDefinition<T>>
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  formatValue?: (key: string, value: unknown, item: T) => ReactNode
}

// Memoized row component to prevent unnecessary re-renders
const OptimizedTableRowComponent = <T extends { id: string | number }>({
  item,
  columns,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
  formatValue
}: OptimizedTableRowProps<T>) => {
  const handleSelect = useCallback(() => {
    onSelect(item.id.toString())
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
      {columns.map((column) => {
        const value = item[column.key as keyof T]
        const displayValue = column.render
          ? column.render(value, item)
          : formatValue
            ? formatValue(column.key as string, value, item)
            : String(value ?? '')

        return (
          <TableCell key={column.key as string}>
            {displayValue}
          </TableCell>
        )
      })}
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
}

export const OptimizedTableRow = memo(OptimizedTableRowComponent) as typeof OptimizedTableRowComponent

// Bulk Actions Bar Component
interface BulkActionsBarProps<T> {
  selectedCount: number
  selectedItems: string[]
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  getPreviewNames: (items: string[]) => string
}

const BulkActionsBar = memo(({
  selectedCount,
  selectedItems,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  getPreviewNames
}: BulkActionsBarProps<any>) => {
  if (selectedCount === 0) { return null }

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-800">
          {selectedCount} item dipilih
        </span>
        <Badge variant="secondary" className="text-xs">
          {getPreviewNames(selectedItems)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800"
        >
          Batal
        </Button>
      </div>
      <div className="flex items-center gap-2">
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
interface OptimizedTableProps<T extends { id: string | number }> {
  data: T[]
  columns: Array<ColumnDefinition<T>>
  selectedItems: string[]
  onSelectAll: () => void
  onSelectItem: (id: string) => void
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  formatValue?: (key: string, value: unknown, item: T) => ReactNode
  emptyStateComponent?: ReactNode
  title?: string
  description?: string
}

export const OptimizedTable = memo(<T extends { id: string | number }>({
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
}: OptimizedTableProps<T>) => {
  const isAllSelected = useMemo(() =>
    selectedItems.length === data.length && data.length > 0,
    [selectedItems.length, data.length]
  )

  const getPreviewNames = useCallback((items: string[]) => {
    const selectedData = data.filter(item => items.includes(item.id.toString()))
    const names = selectedData.map(item => {
      const itemAny = item as any
      return itemAny.name || itemAny.title || item.id
    }).slice(0, 2)
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
                <TableHead key={column.key as string}>{column.label}</TableHead>
              ))}
              <TableHead className="w-32">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <OptimizedTableRow<T>
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