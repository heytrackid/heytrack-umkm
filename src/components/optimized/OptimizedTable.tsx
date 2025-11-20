'use client'

import { MoreHorizontal, Edit2, Trash2, Eye } from '@/components/icons'
import { type ReactNode, memo, useMemo, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ColumnDefinition<T extends { id: number | string }> {
  key: string | keyof T
  label: string
  render?: (value: unknown, item: T) => ReactNode
}

interface OptimizedTableRowProps<T extends { id: number | string }> {
  item: T
  columns: Array<ColumnDefinition<T>>
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  formatValue?: (key: string, value: unknown, item: T) => ReactNode
}

const OptimizedTableRowComponent = <T extends { id: number | string }>({
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
    onSelect(item['id'].toString())
  }, [onSelect, item])

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
    <TableRow className="hover:bg-muted">
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={handleSelect} />
      </TableCell>
      {columns.map((column) => {
        const {key} = column
        const value = key in item ? item[key as keyof T] : undefined
        
        let displayValue: React.ReactNode
        if (column.render) {
          displayValue = column.render(value, item)
        } else if (formatValue) {
          displayValue = formatValue(String(key), value, item)
        } else {
          displayValue = String(value ?? '')
        }

        return (
          <TableCell key={String(key)}>
            {displayValue}
          </TableCell>
        )
      })}
      <TableCell>
        <div className="flex items-center gap-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={handleView}>
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
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
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

interface BulkActionsBarProps {
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
}: BulkActionsBarProps) => {
  if (selectedCount === 0) { return null }

  return (
    <div className="flex items-center justify-between p-4 bg-muted border border-border/20 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} item dipilih
        </span>
        <Badge variant="secondary" className="text-xs">
          {getPreviewNames(selectedItems)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground"
        >
          Batal
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBulkEdit}>
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

interface OptimizedTableProps<T extends { id: number | string }> {
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
  isLoading?: boolean
}

const OptimizedTableComponent = <T extends { id: number | string }>({
  data,
  columns,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  onEdit,
  isLoading = false,
  onDelete,
  onView,
  formatValue,
  emptyStateComponent,
  title: _title,
  description: _description
}: OptimizedTableProps<T>) => {
  const isAllSelected = useMemo(() =>
    selectedItems.length === data.length && data.length > 0,
  [selectedItems.length, data.length])

  const getPreviewNames = useCallback((items: string[]) => {
    const selectedData = data.filter(item => items.includes(item['id'].toString()))
    const names = selectedData.map(item => {
      const itemRecord = item as Record<string, unknown>
      return (itemRecord['name'] as string) || (itemRecord['title'] as string) || String(item['id'])
    }).slice(0, 2)
    return names.join(', ') + (items.length > 2 ? ` +${items.length - 2} lainnya` : '')
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4 p-4 border rounded-md">
          <div className="h-4 bg-muted rounded w-1/4" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return emptyStateComponent ?? <div>Tidak ada data</div>
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
                <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.label}</TableHead>
              ))}
              <TableHead className="w-32">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <OptimizedTableRow<T>
                key={item['id']}
                item={item}
                columns={columns}
                isSelected={selectedItems.includes(item['id'].toString())}
                onSelect={onSelectItem}
                formatValue={formatValue}
                {...(onEdit && { onEdit })}
                {...(onDelete && { onDelete })}
                {...(onView && { onView })}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

OptimizedTableComponent.displayName = 'OptimizedTable'

export const OptimizedTable = memo(OptimizedTableComponent) as <T extends { id: number | string }>(
  props: OptimizedTableProps<T>
) => JSX.Element
