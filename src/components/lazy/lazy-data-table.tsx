'use client'

import { lazy, Suspense } from 'react'

import { DataTableSkeleton } from '@/components/ui/skeletons'

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
    <Suspense fallback={<DataTableSkeleton />}>
      <LazyDataTableComponent {...(props as DataTableProps<unknown, unknown>)} />
    </Suspense>
  )
}
