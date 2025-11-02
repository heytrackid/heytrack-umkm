'use client'

import { useState, useEffect, Suspense, type ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'



// Progressive loading for heavy data operations
interface ProgressiveLoaderProps {
  children: ReactNode
  fallback?: ReactNode
  timeout?: number
  showRetry?: boolean
  loadingMessage?: string
}

export const ProgressiveLoader = ({
  children,
  fallback,
  timeout = 3000,
  showRetry = true,
  loadingMessage = "Loading content..."
}: ProgressiveLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true)
      }
    }, timeout)

    // Simulate loading completion
    const loadTimer = setTimeout(() => {
      void setIsLoading(false)
    }, Math.random() * 2000 + 500)

    return () => {
      clearTimeout(timer)
      clearTimeout(loadTimer)
    }
  }, [timeout, isLoading])

  const handleRetry = () => {
    void setIsLoading(true)
    void setHasError(false)
    setShowTimeout(false)
  }

  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            <p>Failed to load content</p>
          </div>
          {showRetry && (
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return fallback || (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3">{loadingMessage}</span>
          </div>
          {showTimeout && (
            <div className="text-center text-sm text-muted-foreground">
              <p>This is taking longer than usual...</p>
              {showRetry && (
                <Button onClick={handleRetry} variant="ghost" size="sm" className="mt-2">
                  Retry
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

// Lazy data table dengan progressive loading
interface TableColumn<T extends Record<string, ReactNode>> {
  header: string
  accessor: keyof T
}

export const ProgressiveDataTable = <T extends Record<string, ReactNode>>({
  data,
  columns,
  pageSize = 10,
  virtualizeThreshold = 100
}: {
  data: T[]
  columns: Array<TableColumn<T>>
  pageSize?: number
  virtualizeThreshold?: number
}) => {
  const [loadedPages, setLoadedPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const shouldVirtualize = data.length > virtualizeThreshold
  const displayedData = data.slice(0, loadedPages * pageSize)

  const loadMore = async () => {
    void setIsLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    void setLoadedPages(prev => prev + 1)
    void setIsLoadingMore(false)
  }

  if (shouldVirtualize) {
    // For very large datasets, load virtualized table
    return (
      <Suspense fallback={<DataTableSkeleton />}>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Large dataset detected ({data.length} items). Using optimized virtual table.
          </p>
          <VirtualizedTableLoader data={data} columns={columns} />
        </div>
      </Suspense>
    )
  }

  return (
    <div>
      <SimpleTableView data={displayedData} columns={columns} />

      {displayedData.length < data.length && (
        <div className="text-center p-4 border-t">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                Loading more...
              </>
            ) : (
              `Load more (${data.length - displayedData.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Skeleton components untuk different loading states
export const DataTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="border rounded-lg">
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export const FormSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex justify-end gap-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
)

export const StatsCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-full mt-2" />
    </CardContent>
  </Card>
)

// Virtual table loader for heavy datasets
const VirtualizedTableLoader = <T extends { length?: number }>({ data }: { data?: T; columns?: unknown }) =>
// Simulate heavy data processing
(
  <div className="p-4 border rounded-lg bg-muted/50">
    <p className="text-sm">Optimized view ready for {data?.length || 0} items</p>
    <Button className="mt-2" variant="outline" size="sm">
      Load Virtual Table
    </Button>
  </div>
)


// Simple table view for smaller datasets
const SimpleTableView = <T extends Record<string, ReactNode>>({
  data,
  columns
}: {
  data: T[];
  columns: Array<TableColumn<T>>
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          {columns?.map((col, i: number) => (
            <th key={i} className="p-2 text-left font-medium">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i: number) => (
          <tr key={i} className="border-b hover:bg-muted/50">
            {columns.map((col, j: number) => (
              <td key={j} className="p-2">
                {row[col.accessor] ?? null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Progressive image loading
export const ProgressiveImage = ({
  src,
  alt,
  className = "",
  fallback
}: {
  src: string
  alt: string
  className?: string
  fallback?: ReactNode
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      {hasError && fallback && fallback}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

// Hook untuk progressive data loading
export function useProgressiveData<T>(
  fetchFunction: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadData = async () => {
    try {
      void setLoading(true)
      void setError(null)
      const result = await fetchFunction()
      void setData(result)
    } catch (err: unknown) {
      const error = err as Error
      void setError(error)
    } finally {
      void setLoading(false)
    }
  }

  const retry = () => {
    setRetryCount((prev) => prev + 1)
    void loadData()
  }

  useEffect(() => {
    void loadData()
  }, [...deps, retryCount])

  return { data, loading, error, retry }
}
