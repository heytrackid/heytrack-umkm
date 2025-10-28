/**
 * Virtualized List Component
 * Renders only visible items for better performance with large lists
 */

'use client'

import { useVirtualScroll } from '@/lib/performance-optimized'
import { type ReactNode, memo } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  emptyMessage?: string
}

function VirtualizedListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  className = '',
  emptyMessage = 'Tidak ada data'
}: VirtualizedListProps<T>) {
  const { visibleItems, totalHeight, offsetY, handleScroll, visibleRange } =
    useVirtualScroll(items, itemHeight, containerHeight)

  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index
            return (
              <div
                key={keyExtractor(item, actualIndex)}
                style={{ height: itemHeight }}
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent