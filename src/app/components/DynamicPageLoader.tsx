'use client'

import { useState, useEffect, useMemo, useCallback, type ComponentType } from 'react'
import dynamic from 'next/dynamic'

/**
 * Dynamic Page Loading with next/dynamic
 * Provides optimized loading for heavy page components
 */

const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
      <p className="text-lg text-muted-foreground">Loading page...</p>
    </div>
  </div>
)

const FormLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="text-center space-y-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
      <p className="text-sm text-muted-foreground">Loading form...</p>
    </div>
  </div>
)

const TableLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
      <p className="text-sm text-muted-foreground">Loading data...</p>
    </div>
  </div>
)

/**
 * Create dynamically loaded component with custom options
 */
export function createDynamicComponent<T = unknown >(
  loader: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    loading?: () => JSX.Element
    ssr?: boolean
  }
) {
  return dynamic(loader, {
    loading: options?.loading || PageLoadingFallback,
    ssr: options?.ssr ?? true
  })
}

/**
 * Pre-configured dynamic loaders for common component types
 */
export const DynamicLoaders = {
  /**
   * For heavy form components
   */
  form: <T = unknown >(loader: () => Promise<{ default: ComponentType<T> }>) =>
    dynamic(loader, {
      loading: FormLoadingFallback,
      ssr: false // Forms don't need SSR
    }),

  /**
   * For data table components
   */
  table: <T = unknown >(loader: () => Promise<{ default: ComponentType<T> }>) =>
    dynamic(loader, {
      loading: TableLoadingFallback,
      ssr: true
    }),

  /**
   * For page-level components
   */
  page: <T = unknown >(loader: () => Promise<{ default: ComponentType<T> }>) =>
    dynamic(loader, {
      loading: PageLoadingFallback,
      ssr: true
    }),

  /**
   * For client-only heavy components (charts, etc)
   */
  clientOnly: <T = unknown >(loader: () => Promise<{ default: ComponentType<T> }>) =>
    dynamic(loader, {
      loading: PageLoadingFallback,
      ssr: false
    })
}

export default DynamicLoaders
