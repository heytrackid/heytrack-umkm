'use client'
import * as React from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ComponentType, lazy, Suspense } from 'react'
import { uiLogger } from '@/lib/logger'

// Table Loading Skeleton Component
const TableLoadingSkeleton = ({ 
  columns = 6, 
  rows = 10, 
  showHeader = true,
  showPagination = true 
}: { 
  columns?: number
  rows?: number
  showHeader?: boolean
  showPagination?: boolean
}) => (
  <Card>
    {showHeader && (
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
    )}
    <CardContent>
      <div className="space-y-4">
        {/* Search and filters skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Table skeleton */}
        <div className="border rounded-lg">
          {/* Table header */}
          <div className="p-4 border-b bg-muted/50">
            <div className={`grid grid-cols-${columns} gap-4`}>
              {Array.from({ length: columns }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          
          {/* Table rows */}
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className={`grid grid-cols-${columns} gap-4`}>
                {Array.from({ length: columns }, (_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination skeleton */}
        {showPagination && (
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

// Lazy loaded table components
export const LazyDataTable = lazy(() => 
  import('@/components').then(async (m) => {
    // Also preload the table UI components
    await import('@/components')
    return { default: m.useReactTable }
  })
)

// CRUD Table Components
export const LazyCRUDTable = lazy(() => 
  import('@/components').then(m => ({ default: m.IngredientsCRUD }))
)

export const LazyOrdersTable = lazy(() => 
  import('@/components').then(m => ({ default: m.OrdersTable }))
    .catch(() => ({ default: () => <div>Orders table not found</div> }))
)

export const LazyInventoryTable = lazy(() => 
  import('@/components').then(m => ({ default: m.InventoryTable }))
    .catch(() => ({ default: () => <div>Inventory table not found</div> }))
)

export const LazyFinanceTable = lazy(() => 
  import('@/components').then(m => ({ default: m.FinanceTable }))
    .catch(() => ({ default: () => <div>Finance table not found</div> }))
)

// Table Wrapper Components with Suspense
export const DataTableWithSuspense = ({ 
  columns = 6, 
  rows = 10, 
  showHeader = true, 
  showPagination = true,
  Component,
  ...props 
}: {
  columns?: number
  rows?: number
  showHeader?: boolean
  showPagination?: boolean
  Component: ComponentType<unknown>
  [key: string]: unknown
}) => (
  <Suspense fallback={
    <TableLoadingSkeleton 
      columns={columns} 
      rows={rows} 
      showHeader={showHeader} 
      showPagination={showPagination} 
    />
  }>
    <Component {...props} />
  </Suspense>
)

// Specialized table loaders
export const CRUDTableWithSuspense = (props: any) => (
  <DataTableWithSuspense 
    columns={6} 
    rows={10} 
    Component={LazyCRUDTable} 
    {...props} 
  />
)

export const OrdersTableWithSuspense = (props: any) => (
  <DataTableWithSuspense 
    columns={6} 
    rows={8} 
    Component={LazyOrdersTable} 
    {...props} 
  />
)

export const InventoryTableWithSuspense = (props: any) => (
  <DataTableWithSuspense 
    columns={7} 
    rows={12} 
    Component={LazyInventoryTable} 
    {...props} 
  />
)

export const FinanceTableWithSuspense = (props: any) => (
  <DataTableWithSuspense 
    columns={5} 
    rows={15} 
    Component={LazyFinanceTable} 
    {...props} 
  />
)

// Virtual Table for Large Datasets
export const LazyVirtualizedTable = lazy(() =>
  Promise.resolve({
    default: ({ data, height, ...props }: { data?: any[]; height?: number; [key: string]: unknown }) => {
      // This would be a virtualized table implementation
      // For now, return a placeholder
      return <div style={{ height }}>Virtualized table with {data?.length || 0} items</div>
    }
  })
)

export const VirtualizedTableWithSuspense = ({ 
  data = [], 
  columns = [], 
  height = 400,
  ...props 
}: { 
  data?: any[]; 
  columns?: unknown[]; 
  height?: number; 
  [key: string]: unknown 
}) => (
  <Suspense fallback={
    <TableLoadingSkeleton columns={columns?.length || 6} rows={Math.floor(height / 50)} />
  }>
    <LazyVirtualizedTable data={data} columns={columns} height={height} {...props} />
  </Suspense>
)

// Table Performance Hook
export const useTablePerformance = () => {
  const startTableTiming = (tableName: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`table-${tableName}-start`)
    }
  }

  const endTableTiming = (tableName: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`table-${tableName}-end`)
      performance.measure(
        `table-${tableName}-duration`,
        `table-${tableName}-start`,
        `table-${tableName}-end`
      )
      
      const measure = performance.getEntriesByName(`table-${tableName}-duration`)[0]
      if (measure && measure.duration > 2000) {
        uiLogger.warn('Slow table rendering', { 
          tableName, 
          duration: measure.duration.toFixed(2) 
        })
      }
    }
  }

  return { startTableTiming, endTableTiming }
}

// Table Bundle Preloader
export const preloadTableBundle = () => {
  return Promise.all([
    import('@/components'),
    import('@/components'),
    import('@/components'),
  ])
}

// Table Type Detection for Dynamic Loading
export type TableType = 'crud' | 'orders' | 'inventory' | 'finance' | 'virtualized'

export const TableContainer = ({ 
  type, 
  data, 
  columns, 
  loading = false,
  ...props 
}: {
  type: TableType
  data?: any[]
  columns?: unknown[]
  loading?: boolean
  [key: string]: unknown
}) => {
  if (loading) {
    return <TableLoadingSkeleton columns={columns?.length || 6} />
  }

  const TableComponents = {
    crud: CRUDTableWithSuspense,
    orders: OrdersTableWithSuspense,
    inventory: InventoryTableWithSuspense,
    finance: FinanceTableWithSuspense,
    virtualized: VirtualizedTableWithSuspense
  }

  const TableComponent = TableComponents[type]
  
  return <TableComponent data={data} columns={columns} {...props} />
}

// Intersection Observer for Table Lazy Loading
export const useTableIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void
) => {
  const observer = new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
  })

  return observer
}

// Table Row Virtualization Helper
export const useRowVirtualization = (totalRows: number, rowHeight = 50) => {
  const getVisibleRange = (scrollTop: number, containerHeight: number) => {
    const start = Math.floor(scrollTop / rowHeight)
    const visibleCount = Math.ceil(containerHeight / rowHeight)
    const end = Math.min(start + visibleCount + 5, totalRows) // +5 for buffer
    
    return { start: Math.max(0, start - 2), end } // -2 for buffer
  }

  const getTotalHeight = () => totalRows * rowHeight

  return { getVisibleRange, getTotalHeight }
}