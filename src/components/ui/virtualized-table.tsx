'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'

import { useResponsive } from '@/utils/responsive'

interface VirtualizedTableProps<T> {
  data: T[]
  columns: Array<{
    header: string
    accessor: keyof T
    cell?: (item: T) => React.ReactNode
  }>
  rowHeight?: number
  className?: string
}

export const VirtualizedTable = <T extends Record<string, unknown>>({
  data,
  columns,
  rowHeight: defaultRowHeight = 50,
  className = ''
}: VirtualizedTableProps<T>) => {
  const { isMobile } = useResponsive()
  const rowHeight = isMobile ? 60 : defaultRowHeight
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (!parentRef.current) {
      return () => {};
    }

    const updateHeight = () => {
      const availableHeight = window.innerHeight * 0.6;
      setContainerHeight(Math.min(Math.max(availableHeight, 300), 600));
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <table className="w-full">
        <thead className="bg-muted sticky top-0 z-10">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="p-3 text-left text-sm font-medium text-muted-foreground border-b"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: `${containerHeight}px`,
        }}
      >
        <table className="w-full">
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = data[virtualRow.index];
              if (!row) {return null;}
              return (
                <tr
                  key={virtualRow.index}
                  className={`border-b hover:bg-muted/50 ${virtualRow.index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-3 text-sm"
                    >
                      {column.cell ? column.cell(row) : String(row[column.accessor] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
          }}
        />
      </div>
    </div>
  );
};
