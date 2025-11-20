'use client'

import { lazy, Suspense } from 'react'

import { TableSkeleton } from '@/components/ui/skeleton-loader'

import type { DataTableProps } from '@/components/data-table/data-table'

// Lazy load the DataTable component
const LazyDataTableComponent = lazy(() =>
  import('../data-table/data-table').then(module => ({
    default: module.DataTable as React.ComponentType<DataTableProps<unknown, unknown>>
  }))
)

/**
 * LazyDataTable - Lazy loaded version of DataTable for better performance
 * Automatically shows skeleton while loading
 */
export const LazyDataTable = <TData, TValue>(props: DataTableProps<TData, TValue>) => {
  return (
    <Suspense fallback={<TableSkeleton rows={8} columns={4} />}>
      <LazyDataTableComponent {...(props as DataTableProps<unknown, unknown>)} />
    </Suspense>
  )
}
