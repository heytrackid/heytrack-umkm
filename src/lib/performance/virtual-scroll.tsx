'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, type ReactNode } from 'react'





interface VirtualScrollProps<T> {
    items: T[]
    height: number
    itemHeight: number
    renderItem: (item: T, index: number) => ReactNode
    overscan?: number
    className?: string
}

export const VirtualScroll = <T,>({
    items,
    height,
    itemHeight,
    renderItem,
    overscan = 5,
    className = ''
}: VirtualScrollProps<T>) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemHeight,
        overscan
    })

    return (
        <div
            ref={parentRef}
            className={className}
            style={{
                height: `${height}px`,
                overflow: 'auto'
            }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => (
                    <div
                        key={virtualItem.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`
                        }}
                    >
                        {renderItem(items[virtualItem.index], virtualItem.index)}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Hook for virtual scrolling
export const useVirtualScroll = <T,>(
    items: T[],
    containerRef: React.RefObject<HTMLElement>,
    itemHeight: number,
    overscan = 5
) => useVirtualizer({
        count: items.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => itemHeight,
        overscan
    })
