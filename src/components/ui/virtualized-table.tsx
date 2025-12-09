'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useResponsive } from '@/utils/responsive'

interface VirtualizedTableProps<T> {
  data: T[]
  columns: Array<{
    header: string
    accessor: keyof T
    cell?: (item: T) => React.ReactNode
    width?: string | number
  }>
  rowHeight?: number
  className?: string
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export const VirtualizedTable = <T extends Record<string, unknown>>({
  data,
  columns,
  rowHeight: defaultRowHeight = 48,
  className = '',
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick
}: VirtualizedTableProps<T>) => {
  const { isMobile } = useResponsive()
  const rowHeight = isMobile ? 56 : defaultRowHeight
  const parentRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(400)

  useEffect(() => {
    const updateHeight = () => {
      const availableHeight = window.innerHeight * 0.5
      setContainerHeight(Math.min(Math.max(availableHeight, 250), 500))
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  if (isLoading) {
    return (
      <div className={cn('border rounded-lg overflow-hidden', className)}>
        <div className="animate-pulse space-y-3 p-4">
          <div className="h-4 bg-muted rounded w-1/4" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('border rounded-lg overflow-hidden', className)}>
        <table className="w-full table-fixed">
          <thead className="bg-muted">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="p-3 text-left text-sm font-medium text-muted-foreground border-b"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Fixed Header */}
      <div className="bg-muted border-b">
        <table className="w-full table-fixed">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="p-3 text-left text-sm font-medium text-muted-foreground"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${containerHeight}px` }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <table className="w-full table-fixed" style={{ position: 'absolute', top: 0, left: 0 }}>
            <tbody>
              {virtualItems.map((virtualRow) => {
                const row = data[virtualRow.index]
                if (!row) return null

                return (
                  <tr
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    className={cn(
                      'border-b transition-colors',
                      virtualRow.index % 2 === 0 ? 'bg-background' : 'bg-muted/30',
                      onRowClick && 'cursor-pointer hover:bg-muted/50'
                    )}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${rowHeight}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="p-3 text-sm truncate"
                        style={{ width: column.width }}
                      >
                        {column.cell ? column.cell(row) : String(row[column.accessor] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
